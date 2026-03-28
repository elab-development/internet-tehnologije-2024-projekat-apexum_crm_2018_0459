<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    /**
     * GET /admin/users
     *
     * Query params:
     * - role      : optional, one of User::ROLES (admin|manager|sales_rep)
     * - search    : optional, matches name or email
     * - per_page  : optional, default 25
     */
    public function index(Request $request)
    {

        $role     = $request->query('role');
        $search   = $request->query('search');
        $perPage  = (int) $request->query('per_page', 25);

        $q = User::query();

        if ($role) {
            // accept only valid roles
            if (! in_array($role, User::ROLES, true)) {
                return response()->json(['message' => 'Invalid role filter.'], 422);
            }
            $q->where('role', $role);
        }

        if ($search) {
            $q->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $q
            ->orderBy('name')
            ->select(['id','name','email','role','image_url','created_at']) // keep it lean
            ->paginate($perPage);

        return response()->json($users);
    }
}
