# 🔄 Medical Checkup Web Application — Workflow Diagrams

This document contains detailed Mermaid diagrams illustrating how the web application works, including all API scenarios (GET, POST, DELETE).

---

## 📋 Table of Contents

1. [Overall Architecture](#1-overall-architecture)
2. [Authentication Flow](#2-authentication-flow)
3. [GET Scenario — Fetch Medical Records](#3-get-scenario--fetch-medical-records)
4. [POST Scenario — Save New Medical Record](#4-post-scenario--save-new-medical-record)
5. [DELETE Scenario — Remove a Record](#5-delete-scenario--remove-a-record)
6. [Client-Side Filter Flow](#6-client-side-filter-flow)
7. [Complete Request/Response Cycle](#7-complete-requestresponse-cycle)

---

## 1. Overall Architecture

```mermaid
graph TB
    subgraph "Browser (Client)"
        HTML[HTML Page<br/>index.html]
        JS[JavaScript<br/>script.js]
        CSS[Styles<br/>style.css]
    end

    subgraph "Node.js Server"
        EXPRESS[Express.js App<br/>app.js]
        AUTH[Basic Auth<br/>Middleware]
        API[API Routes<br/>GET/POST/DELETE]
    end

    subgraph "Docker Network"
        DB[(PostgreSQL Database<br/>blood_db)]
    end

    HTML --> JS
    HTML --> CSS
    JS -->|HTTP Request| EXPRESS
    EXPRESS --> AUTH
    AUTH --> API
    API -->|SQL Query| DB
    DB -->|SQL Result| API
    API -->|JSON Response| JS
    JS -->|Update DOM| HTML

    style HTML fill:#e1f5fe
    style JS fill:#81d4fa
    style EXPRESS fill:#c8e6c9
    style API fill:#a5d6a7
    style AUTH fill:#fff59d
    style DB fill:#ef9a9a
```

---

## 2. Authentication Flow

```mermaid
sequenceDiagram
    participant User as 🧑 User Browser
    participant Client as 📄 script.js
    participant Server as 🖥️ app.js
    participant DB as 🗄️ PostgreSQL

    Note over User,Server: Every request requires authentication

    User->>Client: Enter username/password
    User->>Client: Click button (GET/POST/DELETE)
    Client->>Client: Add Authorization header<br/>(Base64 encoded credentials)
    Client->>Server: HTTP Request + Authorization header

    Server->>Server: Extract auth header
    Server->>Server: Decode Base64 → username:password
    Server->>Server: Compare with .env credentials

    alt ✅ Credentials Match
        Server-->>Client: Proceed (200 OK / 201 Created)
        Client->>Client: Process response
    else ❌ Credentials Don't Match
        Server-->>Client: 401 Unauthorized
        Client->>Client: Show error message
    end

    alt GET Request
        Client->>Server: GET /api/checkups
        Server->>DB: SELECT * FROM medical_checkup
        DB-->>Server: Return records
        Server-->>Client: JSON array of records
    end
```

---

## 3. GET Scenario — Fetch Medical Records

```mermaid
graph TB
    Start[🔄 Page Loads / User Views Records] --> Step1["📄 script.js: fetchCheckups() called"]

    Step1 --> Step2["📡 fetch('/api/checkups')<br/>HTTP GET Request"]

    Step2 --> Step3["🖥️ app.js: app.get('/api/checkups')"]

    Step3 --> Step4["🔒 basicAuth middleware<br/>Check credentials"]

    Step4 --> AuthCheck{"✅ Auth<br/>Valid?"}

    AuthCheck -- No --> Error401["❌ Return 401<br/>Unauthorized"]
    AuthCheck -- Yes --> Step5["🔍 pool.query<br/>'SELECT * FROM<br/>medical_checkup<br/>ORDER BY year DESC'"]

    Step5 --> Step6["🗄️ PostgreSQL Database<br/>Executes SQL Query"]

    Step6 --> Step7["📦 Returns Result Set<br/>(Array of records)"]

    Step7 --> Step8["📤 res.json(result.rows)<br/>Send JSON Response"]

    Step8 --> Step9["📄 script.js: Receives JSON data"]

    Step9 --> Step10["📊 filterAndRender()<br/>Apply name filter"]

    Step10 --> Step11["🖼️ renderRecords()<br/>Build table/cards DOM"]

    Step11 --> End[✅ Records Displayed]

    Error401 --> ErrorEnd[⛔ User sees error]

    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style Error401 fill:#ffcdd2
    style ErrorEnd fill:#ffcdd2
    style Step5 fill:#fff9c4
    style Step6 fill:#ffccbc
```

### GET Flow — Detailed SQL

```mermaid
graph LR
    A["GET /api/checkups"] --> B["Express Router"]
    B --> C["Auth Middleware"]
    C --> D["pool.query<br/>SELECT * FROM<br/>public.medical_checkup<br/>ORDER BY year DESC,<br/>id DESC"]

    D --> E["PostgreSQL Engine"]
    E --> F["Scan table<br/>medical_checkup"]
    F --> G["Sort by year DESC<br/>then id DESC"]
    G --> H["Return all rows"]

    H --> I["Express: res.json()"]
    I --> J["JSON Array<br/>[{id, year, first_name,<br/>last_name, ...}]"]

    J --> K["Browser: allCheckups = data"]
    K --> L["renderRecords()"]

    style A fill:#e3f2fd
    style H fill:#c8e6c9
    style J fill:#fff9c4
    style L fill:#bbdefb
```

---

## 4. POST Scenario — Save New Medical Record

```mermaid
graph TB
    Start["📝 User Fills Form"] --> Step1["📄 User clicks Save Medical Checkup button"]

    Step1 --> Step2["📄 script.js: form submit event<br/>e.preventDefault()"]

    Step2 --> Step3["📄 Collect form data<br/>Loop through all 35 fields"]

    Step3 --> Step4["📄 Convert to JavaScript object<br/>formData with all field values"]

    Step4 --> Step5["📄 JSON.stringify(formData)"]

    Step5 --> Step6["📡 HTTP POST to /api/checkups<br/>Content-Type: application/json"]

    Step6 --> Step7["🖥️ app.js: app.post('/api/checkups')"]

    Step7 --> Step8["🔒 basicAuth middleware<br/>Check credentials"]

    Step8 --> AuthCheck{"✅ Auth<br/>Valid?"}

    AuthCheck -- No --> Error401["❌ Return 401<br/>Unauthorized"]

    AuthCheck -- Yes --> Step9["📥 req.body<br/>Extract 35 fields from request"]

    Step9 --> Step10["🔍 pool.query<br/>INSERT INTO public.medical_checkup<br/>VALUES ($1, $2, ...) RETURNING *"]

    Step10 --> Step11["🗄️ PostgreSQL Database<br/>Insert new row"]

    Step11 --> Step12["✅ Row inserted<br/>Return inserted record"]

    Step12 --> Step13["📤 res.status(201).json(result.rows[0])"]

    Step13 --> Step14["📄 script.js: Receives saved record"]

    Step14 --> Step15["✅ alert Data saved!"]

    Step15 --> Step16["📄 form.reset()<br/>Clear the form"]

    Step16 --> Step17["📄 fetchCheckups()<br/>Reload records"]

    Step17 --> End["✅ Record Saved & Displayed"]

    Error401 --> ErrorEnd["⛔ User sees error"]

    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style Error401 fill:#ffcdd2
    style ErrorEnd fill:#ffcdd2
    style Step10 fill:#fff9c4
    style Step11 fill:#ffccbc
```

### POST — Data Structure

```mermaid
graph TB
    F1["Year: 2024"]
    F2["First Name: John"]
    F3["Last Name: Doe"]
    F4["Gender: Male"]
    F5["Weight: 70"]
    F6["Height: 175"]
    F7["Sugar: 95"]
    F8["... all 35 fields"]
    JS1["formData object with all field values"]
    JSON1["JSON: year, first_name, last_name, etc."]
    SQL1["INSERT INTO medical_checkup VALUES"]
    SQL2["PostgreSQL: New row created"]
    F1 --> JS1
    F2 --> JS1
    F3 --> JS1
    F4 --> JS1
    F5 --> JS1
    F6 --> JS1
    F7 --> JS1
    F8 --> JS1
    JS1 --> JSON1
    JSON1 --> SQL1
    SQL1 --> SQL2
```

---

## 5. DELETE Scenario — Remove a Record

```mermaid
sequenceDiagram
    participant User as 🧑 User
    participant Client as 📄 script.js
    participant Server as 🖥️ app.js
    participant DB as 🗄️ PostgreSQL

    User->>Client: Click "Delete" button on a record
    Client->>Client: deleteCheckup(id) called

    Client->>User: ⚠️ confirm('Are you sure?')

    alt User clicks "Cancel"
        User-->>Client: Dialog closed
        Client->>Client: Do nothing (stop)
    else User clicks "OK"
        User-->>Client: Confirmed

        Client->>Server: DELETE /api/checkups/:id<br/>(e.g., /api/checkups/42)

        Server->>Server: 🔒 basicAuth middleware<br/>Check credentials

        Server->>Server: Extract id from req.params

        Server->>DB: DELETE FROM<br/>public.medical_checkup<br/>WHERE id = $1<br/>RETURNING *

        DB-->>Server: Return deleted record

        alt Record Found
            Server-->>Client: 200 OK<br/>{message: 'Record deleted',<br/> deleted: {...}}
            Client->>Client: alert('Deleted!')
            Client->>Client: fetchCheckups()<br/>(Reload data)
            Client->>Client: Re-render table
        else Record Not Found
            Server-->>Client: 404 Not Found<br/>{error: 'Record not found'}
            Client->>Client: Show error
        end
    end
```

---

## 6. Client-Side Filter Flow

```mermaid
graph TB
    Start[📄 Page Loaded with Records] --> UserAction["👤 User types in<br/>'Filter by Name' input"]

    UserAction --> Event["📄 'input' event fired<br/>nameFilter.addEventListener('input')"]

    Event --> Filter["📄 filterAndRender() called"]

    Filter --> Query["📄 Get search query<br/>query = 'john'"]

    Query --> Check{"Query<br/>empty?"}

    Check -- Yes --> FullData["Use allCheckups<br/>(all records)"]
    Check -- No --> Search["📄 Filter array:<br/>firstName.includes(query)<br/>|| lastName.includes(query)"]

    Search --> Filtered["📄 filtered =<br/>[matching records only]"]

    FullData --> Render["📄 renderRecords(filteredData)"]
    Filtered --> Render

    Render --> ViewMode{"View Mode?"}

    ViewMode -- Desktop --> Table["Build transposed table<br/>Metrics as rows,<br/>Patients as columns"]

    ViewMode -- Mobile --> Cards["Build card list<br/>One card per patient<br/>with all metrics"]

    Table --> End[✅ Filtered Display]
    Cards --> End

    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style UserAction fill:#fff9c4
    style Filter fill:#ffe0b2
```

---

## 7. Complete Request/Response Cycle

```mermaid
stateDiagram-v2
    [*] --> PageLoad: User opens http://localhost:3000

    PageLoad --> AuthPrompt: First request (no credentials)
    AuthPrompt --> [*]: 401 Unauthorized

    PageLoad --> SendCredentials: User enters username/password
    SendCredentials --> FetchData: GET /api/checkups

    FetchData --> AuthCheck: Middleware validates
    AuthCheck --> DataReturned: ✅ Valid
    AuthCheck --> Unauthorized: ❌ Invalid

    DataReturned --> RenderTable: script.js receives JSON
    RenderTable --> DisplayRecords: User sees data

    DisplayRecords --> UserAction: User interacts

    UserAction --> SaveRecord: Submit form (POST)
    SaveRecord --> AuthCheck

    UserAction --> DeleteRecord: Click delete (DELETE)
    DeleteRecord --> AuthCheck

    UserAction --> FilterRecords: Type in filter
    FilterRecords --> ClientFilter: No server request
    ClientFilter --> DisplayRecords

    UserAction --> ViewOnMobile: Resize browser
    ViewOnMobile --> CardView: Switch to cards
    CardView --> DisplayRecords

    Unauthorized --> [*]: Error shown
    SaveRecord --> DisplayRecords: After save + reload
    DeleteRecord --> DisplayRecords: After delete + reload

    note right of FetchData
        GET /api/checkups
        Headers: Authorization: Basic ...
    end note

    note right of SaveRecord
        POST /api/checkups
        Body: {year, first_name, ...}
    end note

    note right of DeleteRecord
        DELETE /api/checkups/:id
        URL param: id
    end note

    note right of ClientFilter
        Client-side only!
        Filters allCheckups array
        No server request needed
    end note
```

---

## 📊 API Endpoints Summary

| Method | Endpoint | Auth Required | Request Body | Response | Description |
|--------|----------|:------------:|--------------|----------|-------------|
| `GET` | `/api/checkups` | ✅ Yes | None | `[{id, year, first_name, ...}]` | Fetch all records |
| `POST` | `/api/checkups` | ✅ Yes | `{year, first_name, last_name, ...}` (35 fields) | `{id, year, first_name, ...}` | Create new record |
| `DELETE` | `/api/checkups/:id` | ✅ Yes | None | `{message, deleted: {...}}` | Delete record by ID |

---

## 🔐 Authentication Details

```mermaid
graph LR
    A["Username: admin<br/>Password: admin1234"] --> B["Concatenate<br/>admin:admin1234"]
    B --> C["Base64 Encode<br/>YWRtaW46YWRtaW4xMjM0"]
    C --> D["Authorization Header<br/>Basic YWRtaW46YWRtaW4xMjM0"]
    D --> E["Sent with every request"]

    E --> F["Server decodes Base64"]
    F --> G["Split by ':' → ['admin', 'admin1234']"]
    G --> H["Compare with .env values"]
    H --> I{"Match?"}
    I -- Yes --> J["✅ Allow request"]
    I -- No --> K["❌ Return 401"]

    style A fill:#e3f2fd
    style D fill:#fff9c4
    style J fill:#c8e6c9
    style K fill:#ffcdd2
```

---

## 🗄️ Database Schema Reference

```sql
CREATE TABLE public.medical_checkup (
    id            bigint NOT NULL,          -- Auto-increment primary key
    year          integer,                  -- Checkup year
    first_name    varchar(50),              -- Patient first name
    last_name     varchar(50),              -- Patient last name
    gender        varchar(15),              -- Male / Female / Other
    weight        double precision,         -- Weight in kg
    height        double precision,         -- Height in cm
    sugar         double precision,         -- Blood sugar (mg/dL)
    bun           double precision,         -- Blood Urea Nitrogen
    creatinine    double precision,         -- Kidney marker
    egrf          double precision,         -- Estimated GFR
    cholesterol   double precision,         -- Total cholesterol
    triglycerides double precision,         -- Triglycerides
    uric_acid     double precision,         -- Uric acid
    total_protein double precision,         -- Total protein
    albumin       double precision,         -- Albumin
    hdl_c         double precision,         -- HDL cholesterol
    ldl_c         double precision,         -- LDL cholesterol
    alk_phos      double precision,         -- Alkaline phosphatase
    sgot          double precision,         -- AST enzyme
    sgpt          double precision,         -- ALT enzyme
    hbs_ag        varchar(20),              -- Hepatitis B surface antigen
    wbc           double precision,         -- White blood cells
    rbc_m         double precision,         -- Red blood cells
    hgb_m         double precision,         -- Hemoglobin
    hct_m         double precision,         -- Hematocrit
    platelets     double precision,         -- Platelet count
    neu           double precision,         -- Neutrophils %
    lymp          double precision,         -- Lymphocytes %
    mono          double precision,         -- Monocytes %
    eos           double precision,         -- Eosinophils %
    baso          double precision,         -- Basophils %
    specific_gravity double precision,      -- Urine specific gravity
    ph            double precision,         -- Urine pH
    urine_exam    varchar(20),              -- Normal / Abnormal
    chest_x_ray   varchar(20)               -- Normal / Abnormal
);
```

---

## 🎨 Frontend Display Logic

```mermaid
graph TB
    Data["📦 JSON Data from API"] --> Parse["📄 Parse each record"]

    Parse --> BMI["⚖️ Calculate BMI<br/>weight / (height/100)²"]

    BMI --> Badge{"Generate Badge<br/>for each metric"}

    Badge --> TextFields["Text Fields<br/>(hbs_ag, urine_exam, chest_x_ray)<br/>'Normal'/'Negative' → 🟢 Green<br/>Other → 🔴 Red"]

    Badge --> Numeric["Numeric Fields<br/>Compare with reference range"]

    Numeric --> GenderRule{"Has gender-specific<br/>range?"}
    GenderRule -- Yes --> UseGender["Use range for<br/>record's gender"]
    GenderRule -- No --> UseDefault["Use default range"]

    UseGender --> Compare["Compare value with min/max"]
    UseDefault --> Compare

    Compare --> Result{"Value in range?"}
    Result -- Yes --> Green["🟢 Green badge<br/>Normal"]
    Result -- No < min --> Blue["🔵 Blue badge<br/>Low"]
    Result -- No > max --> Red["🔴 Red badge<br/>High"]

    Green --> Display["🖼️ Render Table/Cards"]
    Blue --> Display
    Red --> Display
    TextFields --> Display

    style Data fill:#e3f2fd
    style Display fill:#c8e6c9
    style Green fill:#c8e6c9
    style Blue fill:#bbdefb
    style Red fill:#ffcdd2