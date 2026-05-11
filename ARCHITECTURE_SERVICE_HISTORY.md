# 🏗️ Архітектура Нових Функцій

## Діаграма Потоку Даних

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CUSTOMERS PAGE                              │
│  /src/Pages/Customers.js                                            │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                  ┌──────────────┼──────────────┐
                  │              │              │
                  ▼              ▼              ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │ useClients   │  │useNotifications        │
         │  (Context)   │  │  (Context)   │
         └──────────────┘  └──────────────┘  
                  │              │
                  │              │
                  ▼              ▼
         ┌────────────────────────────────┐
         │ checkCustomerServiceReminder() │
         │ /src/utils/customerReminder.js │
         │ (Перевіряє 180-денний період)  │
         └────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
   (6 місяців?)        (< 6 місяців?)
        │                   │
        ▼                   ▼
   needsReminder      needsReminder
   = true             = false
        │                   │
        ├──────────┬────────┤
        │          │        │
        ▼          ▼        ▼
    ┌─────────────────────────────────┐
    │      CUSTOMER CARD RENDER        │
    │  /src/Components/CustomerCard   │
    └─────────────────────────────────┘
        │
        ├─ Показати ЧЕРВОНУ ПОЗНАЧКУ (якщо needsReminder)
        ├─ Показати звичайну КАРТКУ (якщо не потребує)
        │
        └─ Кнопка: 📋 Історія обслуговування
                   (onClick) → setShowServiceHistory(true)
                   │
                   ▼
           ┌──────────────────────┐
           │ ServiceHistoryModal  │
           │ /src/Components...   │
           │ (Відкривається)      │
           └──────────────────────┘
```

---

## Компонентна Структура

```
Customers.js
├── useClients()
│   └── clients[], addCustomer(), deleteCustomer(), ...
│
├── useNotifications()
│   └── notifyMaintenanceNeeded(), notifications[]
│
├── useEffect() - Перевірка статусу ТО
│   └── Для кожного клієнта:
│       ├── checkCustomerServiceReminder(customer)
│       └── if (needsReminder) → notifyMaintenanceNeeded(customer)
│
├── CustomerHeader
│
├── CustomerToolbar
│   └── search, archive toggle
│
├── CustomerList
│   └── filteredCustomers.map() 
│       └── CustomerCard
│           ├── Червона позначка "ТО ПОТРІБНЕ" (умовна)
│           ├── Кнопка "📋 Історія обслуговування"
│           │   └── onClick → setShowServiceHistory(true)
│           │
│           └── ServiceHistoryModal
│               ├── isOpen={showServiceHistory}
│               ├── customer={customer}
│               └── Список замовлень з деталями
│                   ├── Статус (Завершено / В роботі / ...)
│                   ├── Дата і час
│                   ├── Вартість
│                   ├── Послуги
│                   ├── Примітки
│                   └── Спосіб оплати
│
├── CustomerDetailsModal (при натисканні на картку)
│   ├── CustomerCarList
│   │   └── cars.map() - показати машини
│   │
│   └── Форма додавання машини
│       ├── Input: Марка
│       ├── Input: Модель
│       ├── Input: Держ. номер
│       └── Input: VIN-код (новое)
│
└── AddCustomerModal (створення нового клієнта)
    ├── Input: ПІБ
    ├── Input: Телефон
    ├── Input: Марка
    ├── Input: Модель
    ├── Input: Держ. номер
    └── Input: VIN-код (новое)
```

---

## Система Повідомлень про ТО

```
┌────────────────────────────────────────┐
│  PERCHECK: Чи > 180 днів з останнього  │
│  завершеного замовлення?               │
└────────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
        ДА               НІ
         │                │
         ▼                ▼
    ┌────────────┐   ┌──────────────┐
    │notifyMain  │   │Звичайна      │
    │tenanceNeed │   │картка        │
    │ed()        │   └──────────────┘
    └────────────┘
         │
         ├─ Toast-Notification (3 сек)
         │  ╔════════════════════════╗
         │  ║ ⚡ ОБСЛУГОВУВАННЯ...  ║
         │  ║ Ім'я клієнта           ║
         │  ║ Запропонуйте ТО        ║
         │  ╚════════════════════════╝
         │
         └─ Додати у notifications[] список
            (зберігається в localStorage)
```

---

## Стан (State) CustomerCard

```javascript
// CustomerCard.js

const [selectedVIN, setSelectedVIN] = useState(null);
// ▶ Для VINHistoryModal - відкриває історію VIN

const [showServiceHistory, setShowServiceHistory] = useState(false);
// ▶ Для ServiceHistoryModal - відкриває історію замовлень

const reminderInfo = checkCustomerServiceReminder(customer);
// ▶ Об'єкт з інформацією про статус ТО
// {
//   needsReminder: true/false,
//   daysSinceService: 200,
//   monthsSinceService: 6,
//   lastServiceDate: "01.11.2024",
//   message: "Останнє обслуговування 6 місяців тому..."
// }

// UI рендерується залежно від стану:
if (reminderInfo.needsReminder) {
  // Показати ЧЕРВОНУ ПОЗНАЧКУ
  // Показати WARNING MESSAGE
}

if (showServiceHistory) {
  // Показати ServiceHistoryModal
}

if (selectedVIN) {
  // Показати VINHistoryModal
}
```

---

## Стан (State) CustomerDetailsModal

```javascript
// CustomerDetailsModal.js

const [isAddingCar, setIsAddingCar] = useState(false);
// ▶ Розгорнути/згорнути форму додавання машини

const [carData, setCarData] = useState({ 
  brand: '', 
  model: '', 
  plate: '', 
  vin: ''  // ✨ НОВОЕ ПОЛЕ!
});
// ▶ Дані машини під час введення

// При натисканні "Зберегти":
onAddCar(customer.id, {
  brand: carData.brand,
  model: carData.model,
  plate: carData.plate,
  vin: carData.vin  // ✨ Передати VIN!
});
```

---

## Стан (State) NotificationsContext

```javascript
// NotificationsContext.js

const [notifications, setNotifications] = useState([]);
// ▶ Список всіх сповіщень

const [loading, setLoading] = useState(false);
// ▶ Завантаження з серверу

const shownToastIds = useRef(new Set());
// ▶ Запам'ятати які Toast вже показано
// (щоб не показати один раз декілька разів)

// Функція отримання всіх сповіщень:
const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  setNotifications(response.data);
  // Показати Toast для нових
}

// ✨ НОВАЯ ФУНКЦІЯ для ТО:
const notifyMaintenanceNeeded = (customer) => {
  // Генерує Toast-сповіщення
  // Додає запис у notifications[]
  // ID на основі customer.id
}
```

---

## Взаємодія з Backend

### API Endpoints (вже існуючі)

```
GET  /api/customers
     └─ Отримати всіх клієнтів з їх замовленнями

POST /api/cars
     └─ Додати нову машину (включає VIN)

PUT  /api/cars/:id
     └─ Оновити машину (включає VIN)

GET  /api/notifications
     └─ Отримати всі сповіщення

POST /api/notifications
     └─ Створити нове сповіщення
```

### Структура Даних (Customer)

```javascript
{
  id: 1,
  name: "Петро Коваль",
  phone: "+380971234567",
  cars: [
    {
      id: 1,
      brand: "BMW",
      model: "X5",
      plate: "АВ 1234 СД",
      vin: "WBAEV91090EX00000"  // ✨ VIN тепер тут!
    }
  ],
  orders: [
    {
      id: 100,
      status: "COMPLETED",
      createdAt: "2024-11-01T10:00:00Z",
      completedAt: "2024-11-01T12:30:00Z",
      services: [
        {
          id: 1,
          name: "ТО-1",
          price: 1000
        }
      ],
      totalPrice: 1000,
      paymentMethod: "cash",
      notes: "Замінено масло",
      isUrgent: false
    }
  ]
}
```

### Логіка Backend

```
┌─────────────────────────────────┐
│ GET /api/customers              │
│ (Отримати клієнтів з замовле   │
│  нями)                          │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ Prisma запит:                   │
│ await prisma.customer.findMany({│
│   include: {                    │
│     cars: true,                 │
│     orders: {                   │
│       include: { services: true}│
│     }                           │
│   }                             │
│ })                              │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ JSON відповідь з УСІМА ДАННИМ  │
│ включаючи:                      │
│ - cars[].vin ✨                 │
│ - orders[].completedAt          │
│ - orders[].services[]           │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ FRONTEND отримує дані           │
│ Знає дату останнього замовленн  │
│ ня для розрахунку 180 днів      │
└─────────────────────────────────┘
```

---

## Тайм-лайн Виконання Коду

### При завантаженні Customers.js:

```
1. [0ms] - Завантаження компонента
   ├─ useClients() hook - отримати clients[]
   └─ useNotifications() hook - отримати context

2. [500ms] - Rendering CustomerList
   ├─ .map(customer) → CustomerCard
   └─ Для кожної картки:
      ├─ checkCustomerServiceReminder(customer)
      └─ Визначити needsReminder

3. [useEffect] - Перевірка та сповіщення
   └─ if (needsReminder) → notifyMaintenanceNeeded(customer)
      ├─ Генерує toast (видима 3 сек)
      └─ Додає запис у notifications[]

4. [Постійно] - Слухання подій
   ├─ onClick на кнопку "Історія"
   │  └─ setShowServiceHistory(true)
   │     → Показати ServiceHistoryModal
   │
   ├─ onClick на картку
   │  └─ setSelectedCustomerId(customer.id)
   │     → Показати CustomerDetailsModal
   │
   └─ onClick на VIN
      └─ setSelectedVIN(vin)
         → Показати VINHistoryModal
```

---

## Кольорова Схема

```
┌─────────────────────────────────────────┐
│ Статус COMPLETED  →  🟢 #10B981 (зелен)│
│ Статус IN_WORK    →  🔵 #3B82F6 (синій)│
│ Статус READY      →  🟠 #F59E0B (помар)│
│ Статус PENDING    →  🟤 #6B7280 (сірий)│
│ Статус CANCELLED  →  🔴 #EF4444 (черв) │
│                                         │
│ Позначка ТО       →  🔴 #EF4444 (черв) │
│ VIP Позначка      →  🟡 #FBBF24 (жовт) │
└─────────────────────────────────────────┘
```

---

## Помилки які могли виникнути

```
❌ "ServiceHistoryModal not found"
   └─ Перевірте імпорт у CustomerCard.js

❌ "checkCustomerServiceReminder is not defined"
   └─ Імпортуйте з /src/utils/customerReminder.js

❌ "notifyMaintenanceNeeded is undefined"
   └─ Додайте у value object в NotificationsContext

❌ "customer.orders is undefined"
   └─ Переконайтесь що orders завантажуються з backend

❌ "React Hook useEffect has missing dependency"
   └─ Додайте all dependencies до useEffect

✅ ВСІ ПОМИЛКИ ВИРІШЕНИ В ПОТОЧНІЙ РЕАЛІЗАЦІЇ
```

---

## Оптимізація та Перформанс

```javascript
// Оптимізація 1: Мемоізація
const reminderInfo = checkCustomerServiceReminder(customer);
// Отримується один раз на render

// Оптимізація 2: useEffect з залежностями
useEffect(() => {
  // Перевірка ТО тільки коли clients змінюються
  // або при першому завантаженні
}, [clients, notifyMaintenanceNeeded, checkedMaintenanceIds]);

// Оптимізація 3: Set для запам'ятовування
const [checkedMaintenanceIds, setCheckedMaintenanceIds] = useState(new Set());
// Запам'ятовує які клієнти вже отримали сповіщення
// Не розсилає однакові дважди

// Оптимізація 4: Toast id
const safeId = `maintenance-alert-${customer.id}`;
// Унікальний ID для кожного сповіщення
// Запобігає дублюванню
```

---

## Інтеграція з Інтернаціоналізацією (i18n)

Всі тексти використовують **українську** локаль:

```javascript
// Дати у форматі української мови:
date.toLocaleDateString('uk-UA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
// Результат: "01.11.2024"

// Текст за замовчуванням: українська мова
labels, messages, tooltips - всі на українській
```

---

Готово! Архітектура повністю документована.
