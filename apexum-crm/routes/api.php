<?php

// routes/api.php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserAdminController;
use App\Http\Controllers\CustomerController as ManagerCustomerController;
use App\Http\Controllers\MyCustomersController;
use App\Http\Controllers\OpportunityController as SalesOppController;
use App\Http\Controllers\ActivityController as SalesActController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\UserController;

Route::post('/register', [AuthController::class, 'register']); // SK1
Route::post('/login',    [AuthController::class, 'login']);    // SK2

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']); // SK3

    Route::get('/users', [UserController::class, 'index']);

    // Admin
    Route::get('/admin/users',       [UserAdminController::class, 'index']);   
    Route::delete('/admin/users/{id}',[UserAdminController::class, 'destroy']); 

    // Manager
    Route::post('/manager/customers',                   [ManagerCustomerController::class, 'store']);        
    Route::patch('/manager/customers/{id}/ownership',   [ManagerCustomerController::class, 'patchOwnership']); 
    Route::get('/manager/customers',                    [ManagerCustomerController::class, 'index']);         
    Route::get('/manager/customers/{id}',               [ManagerCustomerController::class, 'show']);         
    Route::get('/manager/metrics',                      [ManagerCustomerController::class, 'metrics']);       

    // Sales Rep
    Route::get('/sales/my-customers',               [MyCustomersController::class, 'index']);    
    Route::post('/sales/opportunities',             [SalesOppController::class, 'store']);       
    Route::put('/sales/opportunities/{id}',       [SalesOppController::class, 'update']);      
    Route::post('/sales/activities',                [SalesActController::class, 'store']);       
    Route::patch('/sales/activities/{id}/status',   [SalesActController::class, 'updateStatus']); 
    Route::get('/export/customers/{id}/pdf', [ExportController::class, 'exportCustomerPdf']); 
});
