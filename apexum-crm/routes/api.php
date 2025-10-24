<?php

// routes/api.php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserAdminController;
use App\Http\Controllers\CustomerController as ManagerCustomerController;
use App\Http\Controllers\MyCustomersController;
use App\Http\Controllers\OpportunityController as SalesOppController;
use App\Http\Controllers\ActivityController as SalesActController;
use App\Http\Controllers\ExportController;

Route::post('/register', [AuthController::class, 'register']); // SK1
Route::post('/login',    [AuthController::class, 'login']);    // SK2

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']); // SK3

    // Admin
    Route::get('/admin/users',       [UserAdminController::class, 'index']);   // SK4
    Route::delete('/admin/users/{id}',[UserAdminController::class, 'destroy']); // SK5

    // Manager
    Route::post('/manager/customers',                   [ManagerCustomerController::class, 'store']);         // SK6
    Route::patch('/manager/customers/{id}/ownership',   [ManagerCustomerController::class, 'patchOwnership']); // SK7
    Route::get('/manager/customers',                    [ManagerCustomerController::class, 'index']);         // SK8
    Route::get('/manager/customers/{id}',               [ManagerCustomerController::class, 'show']);          // SK9
    Route::get('/manager/metrics',                      [ManagerCustomerController::class, 'metrics']);       // SK10

    // Sales Rep
    Route::get('/sales/my-customers',               [MyCustomersController::class, 'index']);    // SK11
    Route::post('/sales/opportunities',             [SalesOppController::class, 'store']);       // SK12
    Route::patch('/sales/opportunities/{id}',       [SalesOppController::class, 'update']);      // SK13
    Route::post('/sales/activities',                [SalesActController::class, 'store']);       // SK14
    Route::patch('/sales/activities/{id}/status',   [SalesActController::class, 'updateStatus']); // SK15
    Route::get('/export/customers/{id}/pdf', [ExportController::class, 'exportCustomerPdf']); // SK16 (PDF)
});
