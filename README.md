# Apexum CRM — Laravel / React / MySQL

![Logo](./apexum-crm-front/public/images/logo.png)

Apexum CRM je moderna, **full-stack** aplikacija izgrađena na **Laravel (API)**, **React (SPA)** i **MySQL** stacku. Cilj je da se prodajnim timovima i menadžmentu omogući jasno upravljanje kupcima, prilikama (opportunities) i aktivnostima, uz strogu kontrolu pristupa po korisničkim ulogama.

---

## Tehnologije

- **Backend:** Laravel (REST API, autentikacija, resursi, validacija, policy-ji)
- **Frontend:** React (SPA, React Router, moderne UI komponente, CSS utility klase)
- **Baza:** MySQL (relacije: korisnik, kupac, prilika, aktivnost)
- **Autentikacija:** Laravel Sanctum (SPA tokeni)
- **Ostalo:** Axios (HTTP), React Toastify (notifikacije), React Icons (ikonice)

---

## Korisničke uloge i dozvole

- **Neulogovan korisnik**
  - Dostupno: **Login** i **Register** stranice.
  - Nema pristup aplikaciji dok se uspešno ne autentifikuje.

- **Menadžer (manager)**
  - Pregled i upravljanje kupcima na nivou tima (npr. dodela vlasnika).
  - Analitika i pregled performansi.
  - Nema administratorske privilegije nad korisničkim nalozima.

- **Predstavnik prodaje (sales_rep)**
  - **My Customers**: vidi samo **sopstvene** kupce i njihove prilike/aktivnosti.
  - Kreira i uređuje **prilike i aktivnosti** čiji je vlasnik.
  - Export specifičnog kupca u PDF.
  - Nema pristup administratorskim modulima.

- **Administrator (admin)**
  - **User Management**: pregled, filtriranje, pretraga po ulozi/imeru, brisanje korisnika.
  - Administratorski uvid u sistemske podatke.
  - Nema ograničenja na entitete po vlasništvu (osim gde je definisano poslovnim pravilima).

> **Napomena:** Uređivanje prilika/aktivnosti je dozvoljeno **samo vlasniku** (owner_id = ID prijavljenog korisnika).

---

## Glavne funkcionalnosti

- **Kupci (Customers):**
  - Kartični prikaz sa ključnim podacima (email, telefon, adresa, sajt).
  - Pregled i uređivanje prilika i aktivnosti po kupcu (modali, tabele sa “sticky” zaglavljem).
  - Export kupca u PDF.

- **Prilike (Opportunities):**
  - Kreiranje, uređivanje faze (prospecting/qualification/proposal/won/lost).
  - Validacija i dozvole na nivou API-ja.
  - Inline ažuriranje faze uz PUT rutu.

- **Aktivnosti (Activities):**
  - Kreiranje i ažuriranje statusa (open/completed/cancelled) i tipa (call/email/meeting/task).
  - Povezivanje sa prilikom (opciono) i rokovi (due date).
  - Inline ažuriranja statusa.

- **Administracija korisnika:**
  - SK4: Lista korisnika sa filterom po ulozi i pretragom po imenu; paginacija (podrazumevano 6 po strani).
  - Sortiranje po imenu ASC/DESC.
  - SK5: Brisanje korisnika (uz zaštitu od brisanja poslednjeg admina).

---

## Arhitektura i modulacija

- **Laravel API**
  - `app/Models/*` — Entiteti (User, Customer, Opportunity, Activity) sa `fillable`, `casts`, i setterima (npr. validacija enumeracija).
  - `app/Http/Controllers/*` — REST kontroleri (npr. `OpportunityController`, `UserAdminController`).
  - `app/Http/Resources/*` — Resursi za kontrolisani oblik JSON odgovora.
  - `routes/api.php` — Rute (grupisane po modulu/ulogi), Sanctum middleware.

- **React SPA**
  - `src/pages/*` — Stranice (npr. `SalesRepresentativeHome`, `MyCustomers`, `AdminHome`, `UserManagement`).
  - `src/components/*` — UI komponentice (Avatar, Modal, Field, Inline, itd.).
  - `src/api/api.js` — Axios instance (baseURL, interceptori, `authApi` utili).
  - **Navigacija po ulozi**: čitanje `user` iz `sessionStorage`, dinamičke rute i guardovi.

---

## Instalacija i pokretanje
---------------------------

1. Klonirajte repozitorijum:
```bash
    git clone https://github.com/elab-development/internet-tehnologije-2024-projekat-apexum_crm_2018_0459.git
```
2. Pokrenite backend:
```bash
   cd apexum-crm
   composer install
   php artisan migrate:fresh --seed
   php artisan serve
```
    
3. Pokrenite frontend:
```bash
   cd apexum-crm-front
   npm install
   npm start
```
    
4.  Frontend pokrenut na: [http://localhost:3000](http://localhost:3000) Backend API pokrenut na: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
