<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserAdminController extends Controller
{
    // SK4: Vrati sve korisnike (filter po ulozi, pretraga po imenu, paginacija)
    public function index(Request $request)
    {
        $this->ensureAdmin();

        $role   = $request->query('role');          // admin|manager|sales_rep (optional)
        $search = $request->query('search');        // name contains (optional)
        $perPage= (int)($request->query('per_page', 10));

        $q = User::query();

        if ($role) {
            $q->where('role', $role);
        }

        if ($search) {
            $q->where('name', 'like', "%{$search}%");
        }

        $users = $q->orderBy('name')->paginate($perPage);

        return UserResource::collection($users);
    }

    // SK5: Izbrisi korisnika
    public function destroy($id)
    {
        $this->ensureAdmin();

        $user = User::findOrFail($id);

        // Primer bezbednosne provere: ne brisati poslednjeg admina
        if ($user->role === User::ROLE_ADMIN && User::where('role', User::ROLE_ADMIN)->count() <= 1) {
            return response()->json(['message' => 'Ne možete obrisati poslednjeg admina.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Korisnik obrisan.']);
    }

    private function ensureAdmin(): void
    {
        if (Auth::user()?->role !== User::ROLE_ADMIN) {
            abort(403, 'Dozvoljeno samo adminu.');
        }
    }
}
