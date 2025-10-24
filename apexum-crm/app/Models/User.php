<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable;
    use HasApiTokens;

    // 3 CRM roles max
    public const ROLE_ADMIN     = 'admin';
    public const ROLE_MANAGER   = 'manager';
    public const ROLE_SALES_REP = 'sales_rep';

    public const ROLES = [
        self::ROLE_ADMIN,
        self::ROLE_MANAGER,
        self::ROLE_SALES_REP,
    ];

    protected $fillable = [
        'name', 'email', 'password', 'role', 'image_url',
    ];

    protected $hidden = ['password'];

    public function setRoleAttribute($value): void
    {
        $role = strtolower($value);
        if (! in_array($role, self::ROLES, true)) {
            throw new \InvalidArgumentException("Invalid role: {$value}");
        }
        $this->attributes['role'] = $role;
    }

    // Relationships
    public function customers()
    {
        return $this->hasMany(Customer::class, 'owner_id');
    }

    public function opportunities()
    {
        return $this->hasMany(Opportunity::class, 'owner_id');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class, 'owner_id');
    }
}
