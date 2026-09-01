<?php

namespace App\Models;

use App\Enums\CategoryType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'external_store_id',
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'type',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'type' => CategoryType::class,
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function externalStore(): BelongsTo
    {
        return $this->belongsTo(ExternalStore::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function isManual(): bool
    {
        return $this->type === CategoryType::Manual;
    }

    public function isInStock(): bool
    {
        return $this->stock > 0;
    }

    public function hasExternalStore(): bool
    {
        return $this->external_store_id !== null;
    }
}
