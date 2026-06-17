<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureProfileCompleted
{
    public function handle(Request $request, Closure $next)
    {
        // If the user is logged in, but their username is null...
        if ($request->user() && is_null($request->user()->name)) {
            // Prevent infinite loop if already on the onboard route or logging out
            if (! $request->routeIs('onboard', 'logout')) {
                // ...force them back to the onboarding page
                return redirect()->route('onboard');
            }
        }

        return $next($request);
    }
}
