<?php
// app/Models/Contact.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id', 'first_name', 'last_name', 'email',
        'phone', 'title', 'owner_id',
    ];

    protected $appends = ['full_name'];

    public function owner()      { return $this->belongsTo(User::class, 'owner_id'); }
    public function account()    { return $this->belongsTo(Account::class); }
    public function opportunities(){ return $this->hasMany(Opportunity::class); }
    public function activities() { return $this->morphMany(Activity::class, 'activityable'); }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}
