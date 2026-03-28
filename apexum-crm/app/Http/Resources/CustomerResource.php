<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'email'     => $this->email,
            'phone'     => $this->phone,
            'website'   => $this->website,
            'industry'  => $this->industry,
            'address'   => $this->address,
            'image_url' => $this->image_url,
            'notes'     => $this->notes,

            'owner'         => new UserResource($this->whenLoaded('owner')),
            'opportunities' => OpportunityResource::collection($this->whenLoaded('opportunities')),
            'activities'    => ActivityResource::collection($this->whenLoaded('activities')),

            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
