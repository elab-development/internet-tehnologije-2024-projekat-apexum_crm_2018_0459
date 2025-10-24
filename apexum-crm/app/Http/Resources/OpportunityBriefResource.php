<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OpportunityBriefResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'     => $this->id,
            'title'  => $this->title,
            'stage'  => $this->stage,
            'amount' => $this->amount,
        ];
    }
}
