<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $certificates = Certificate::whereHas('eventRegistration', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->with('eventRegistration.event')->latest()->paginate(10);

        return Inertia::render('Dashboard/Certificates/Index', [
            'certificates' => $certificates,
        ]);
    }

    public function download(Request $request, Certificate $certificate)
    {
        $certificate->load('eventRegistration');

        // Auth check: does the certificate belong to the current user?
        if (! $certificate->eventRegistration || $certificate->eventRegistration->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this certificate.');
        }

        if (! Storage::disk('local')->exists($certificate->file_url)) {
            abort(404, 'Certificate file missing.');
        }

        return response()->download(Storage::disk('local')->path($certificate->file_url), 'certificate.jpg');
    }
}
