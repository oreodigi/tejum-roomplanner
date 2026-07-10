# Customer Journey

## Goal

The planner helps a homeowner, buyer, renovator, architect, interior designer, or builder turn a property into a visual room-by-room smart-home plan. The customer sees a useful preliminary range before deciding whether to request expert help.

The primary experience is `/planner/new`. It is guest-first and does not require an account.

## Primary Journey

### 1. Welcome

The customer sees one promise: plan a smart home in minutes. They can start immediately or sign in to continue an existing account-linked plan.

### 2. Automation Package

The customer chooses Full Home Automation, Smart Controls, Smart Lights, Smart Security, or Recommend for Me. This choice influences room recommendations and integration allowance.

### 3. Property

The customer selects a property type and adjusts floors, bedrooms, bathrooms, and balconies. They also provide project stage, city, budget range, and timeline. No contact information is requested yet.

### 4. Room Map

The room generator uses the selected counts, not a fixed template. The customer can rename, duplicate, delete, add, move, and regenerate rooms. Each room receives a setup level: Essential, Comfort, Premium, or Luxury AI.

### 5. Visual Room Setup

Desktop shows a full-width 3D rectangular room, generated furniture, device palette, recommendation control, placement inspector, and dimensions. The customer can apply a preset, place a device on the room shell, drag it on its valid mounting surface, or remove it from the floating X control.

Mobile provides both an interactive 2D plan and the same 3D room viewer. The device tray is horizontal, room navigation is swipeable, and Save & Next Room stays in thumb reach.

The draft is stored in browser local storage after every change.

### 6. Plan Review

The review shows configured rooms, selected devices, package direction, security coverage, missing rooms, and one high-impact upgrade. It uses visual cards rather than technical tables.

### 7. Preliminary Estimate

The estimate is calculated from actual selected device keys. It separates hardware, installation, and programming/integration, then shows a low/high range. It is explicitly presented as preliminary and subject to site survey.

### 8. Conversion

The customer chooses consultation, site visit, detailed BOQ, or WhatsApp follow-up. Only then are name, phone, city, optional email, and preferred contact method collected.

The server creates:

- customer
- lead
- project and property
- floors and rooms
- room layouts
- project devices
- device placements
- preliminary estimate

The completion screen returns a short project reference.

## Returning Customers

Authenticated users can still access `/planner/projects` and legacy project routes. Admin and sales routes remain protected. `/planner/new` is intentionally public.

## Mobile Versus Desktop

Mobile uses a dedicated header, compact progress, horizontal choice/room trays, 2D/3D room switcher, sticky primary action, and four-item bottom navigation. Desktop uses a wide visual workspace, persistent 3D canvas, device panel, and full flow header.
