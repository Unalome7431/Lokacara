<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

beforeEach(function () {
    $this->superAdmin = User::factory()->create(['role' => 'super_admin']);
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->user = User::factory()->create(['role' => 'user']);
});

test('admins and super admins can access the admin dashboard', function () {
    $response = $this->actingAs($this->admin)->get(route('admin.dashboard'));
    $response->assertStatus(200);

    $response2 = $this->actingAs($this->superAdmin)->get(route('admin.dashboard'));
    $response2->assertStatus(200);
});

test('standard users cannot access the admin dashboard', function () {
    $response = $this->actingAs($this->user)->get(route('admin.dashboard'));
    $response->assertStatus(403);
});

test('super admin can promote a user to admin and demote them back', function () {
    // Promote
    $response = $this->actingAs($this->superAdmin)
        ->post(route('admin.users.change-role', $this->user), [
            'role' => 'admin',
        ]);
    $response->assertRedirect();
    expect($this->user->fresh()->role)->toBe('admin');

    // Demote
    $responseDemote = $this->actingAs($this->superAdmin)
        ->post(route('admin.users.change-role', $this->user), [
            'role' => 'user',
        ]);
    $responseDemote->assertRedirect();
    expect($this->user->fresh()->role)->toBe('user');
});

test('standard admin cannot change user roles', function () {
    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.change-role', $this->user), [
            'role' => 'admin',
        ]);
    $response->assertStatus(403);
    expect($this->user->fresh()->role)->toBe('user');
});

test('admin can suspend and unsuspend a user', function () {
    // Suspend
    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.suspend', $this->user));
    $response->assertRedirect();
    expect($this->user->fresh()->suspended_at)->not->toBeNull();

    // Unsuspend
    $responseUnsuspend = $this->actingAs($this->admin)
        ->post(route('admin.users.unsuspend', $this->user));
    $responseUnsuspend->assertRedirect();
    expect($this->user->fresh()->suspended_at)->toBeNull();
});

test('suspended users cannot login on web and API', function () {
    $password = 'password123';
    $suspendedUser = User::factory()->create([
        'role' => 'user',
        'password' => $password,
        'suspended_at' => now(),
    ]);

    // Web login
    $responseWeb = $this->post(route('login'), [
        'email' => $suspendedUser->email,
        'password' => $password,
    ]);
    
    $responseWeb->assertSessionHasErrors('email');
    expect(Auth::check())->toBeFalse();

    // API login
    $responseApi = $this->postJson('/api/auth/login', [
        'email' => $suspendedUser->email,
        'password' => $password,
    ]);
    $responseApi->assertStatus(403);
});

test('admin can perform category CRUD operations', function () {
    // Create
    $responseCreate = $this->actingAs($this->admin)
        ->post(route('admin.categories.store'), [
            'name' => 'Kategori Keren',
        ]);
    $responseCreate->assertRedirect();
    $responseCreate->assertSessionHasNoErrors();
    $category = Category::where('name', 'Kategori Keren')->first();
    expect($category)->not->toBeNull();
    expect($category->slug)->toBe('kategori-keren');

    // Update
    $responseUpdate = $this->actingAs($this->admin)
        ->put(route('admin.categories.update', $category), [
            'name' => 'Kategori Baru',
        ]);
    $responseUpdate->assertRedirect();
    $responseUpdate->assertSessionHasNoErrors();
    expect($category->fresh()->name)->toBe('Kategori Baru');
    expect($category->fresh()->slug)->toBe('kategori-baru');

    // Delete
    $responseDelete = $this->actingAs($this->admin)
        ->delete(route('admin.categories.destroy', $category));
    $responseDelete->assertRedirect();
    $responseDelete->assertSessionHasNoErrors();
    expect(Category::find($category->id))->toBeNull();
});

test('admin cannot delete category if it is in use by events', function () {
    $category = Category::factory()->create();
    Event::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $category->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($this->admin)
        ->delete(route('admin.categories.destroy', $category));

    $response->assertRedirect();
    $response->assertSessionHas('error');
    expect(Category::find($category->id))->not->toBeNull();
});

test('moderator actions correctly populate audit logs', function () {
    // Trigger Suspend user
    $this->actingAs($this->admin)->post(route('admin.users.suspend', $this->user));

    $log = AuditLog::orderBy('id', 'desc')->first();
    expect($log)->not->toBeNull();
    expect($log->user_id)->toBe($this->admin->id);
    expect($log->action)->toBe('suspend_user');
    expect($log->target_type)->toBe('user');
    expect($log->target_id)->toBe($this->user->id);

    // Trigger category create
    $responseCategory = $this->actingAs($this->admin)->post(route('admin.categories.store'), [
        'name' => 'Kategori Test Audit',
    ]);
    $responseCategory->assertRedirect();
    $responseCategory->assertSessionHasNoErrors();

    $log2 = AuditLog::orderBy('id', 'desc')->first();
    expect($log2->action)->toBe('create_category');
    expect($log2->target_type)->toBe('category');
});
