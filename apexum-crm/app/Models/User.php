<?php
// app/Models/User.php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // CRM roles (keep in sync with your DB enum/string values)
    public const ROLE_ADMIN         = 'admin';
    public const ROLE_SALES_MANAGER = 'sales_manager';
    public const ROLE_SALES_REP     = 'sales_rep';
    public const ROLE_MARKETING     = 'marketing';
    public const ROLE_SUPPORT       = 'support';

    protected $fillable = [
        'name', 'email', 'password', 'image_url', 'role',
    ];

    protected $hidden = ['password','remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // Convenience checks
    public function hasRole(string $role): bool { return $this->role === $role; }
    public function isAdmin(): bool { return $this->hasRole(self::ROLE_ADMIN); }

    // Ownership relationships
    public function accounts()     { return $this->hasMany(Account::class, 'owner_id'); }
    public function contacts()     { return $this->hasMany(Contact::class, 'owner_id'); }
    public function opportunities(){ return $this->hasMany(Opportunity::class, 'owner_id'); }
    public function activities()   { return $this->hasMany(Activity::class); }
}
