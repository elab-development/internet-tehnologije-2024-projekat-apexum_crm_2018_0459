<?php
// app/Models/Account.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'website', 'industry', 'phone',
        'billing_address', 'shipping_address', 'owner_id',
    ];

    public function owner()       { return $this->belongsTo(User::class, 'owner_id'); }
    public function contacts()    { return $this->hasMany(Contact::class); }
    public function opportunities(){ return $this->hasMany(Opportunity::class); }
    public function activities()  { return $this->morphMany(Activity::class, 'activityable'); }
}
