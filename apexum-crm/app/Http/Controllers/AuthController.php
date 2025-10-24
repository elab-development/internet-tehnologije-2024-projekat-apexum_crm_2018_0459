<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // SK1: Registracija
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'password'  => 'required|string|min:6',
            'role'      => 'nullable|in:admin,manager,sales_rep', // optional; default = sales_rep
            'image_url' => 'nullable|url',
        ]);

        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
            'role'      => $data['role'] ?? User::ROLE_SALES_REP,
            'image_url' => $data['image_url'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Korisnik uspešno registrovan.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ], 201);
    }

    // SK2: Login
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Neispravni podaci za prijavu.'], 401);
        }

        /** @var User $user */
        $user  = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Uspešno ste se prijavili.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ]);
    }

    // SK3: Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Uspešno ste se odjavili.']);
    }
}
