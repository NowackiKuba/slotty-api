import type { LocationPointProps } from '@users/domain/types';

export const FIRST_NAMES_MALE = [
  'Adam',
  'Bartek',
  'Cezary',
  'Damian',
  'Filip',
  'Grzegorz',
  'Hubert',
  'Igor',
  'Jakub',
  'Kamil',
  'Łukasz',
  'Marcin',
  'Norbert',
  'Oskar',
  'Paweł',
  'Rafał',
  'Sebastian',
  'Tomasz',
  'Wojciech',
  'Zbigniew',
] as const;

export const FIRST_NAMES_FEMALE = [
  'Agnieszka',
  'Barbara',
  'Celina',
  'Dorota',
  'Ewa',
  'Gabriela',
  'Hanna',
  'Iwona',
  'Joanna',
  'Karolina',
  'Lidia',
  'Magdalena',
  'Natalia',
  'Olga',
  'Patrycja',
  'Renata',
  'Sylwia',
  'Teresa',
  'Urszula',
  'Zofia',
] as const;

export const LAST_NAMES = [
  'Nowak',
  'Kowalski',
  'Wiśniewski',
  'Wójcik',
  'Kowalczyk',
  'Kamiński',
  'Lewandowski',
  'Zieliński',
  'Szymański',
  'Woźniak',
  'Dąbrowski',
  'Kozłowski',
  'Jankowski',
  'Mazur',
  'Kwiatkowski',
  'Krawczyk',
  'Piotrowski',
  'Grabowski',
  'Nowicki',
  'Pawłowski',
  'Michalski',
  'Adamczyk',
  'Dudek',
  'Zając',
  'Wieczorek',
  'Jabłoński',
  'Król',
  'Majewski',
  'Olszewski',
  'Jaworski',
] as const;

export const NICKNAMES = [
  'Bandyta z forehandu',
  'Serwis Maszyna',
  'Kacper Padel',
  'Backhand Killer',
  'Nocna Zmiana',
  'Lobowa Legenda',
  'Slice Master',
  'Poranny Ptaszek',
] as const;

export const TRAINING_PLACES: LocationPointProps[] = [
  {
    name: 'Warszawianka Tenis',
    address: 'Merliniego 2, 02-511 Warszawa',
    lat: 52.1899,
    lng: 21.0117,
  },
  {
    name: 'Legia Tenis & Golf',
    address: 'Myśliwiecka 4, 00-459 Warszawa',
    lat: 52.2237,
    lng: 21.0339,
  },
  {
    name: 'Hala Padel Mokotów',
    address: 'Postępu 15, 02-676 Warszawa',
    lat: 52.181,
    lng: 21.0002,
  },
  {
    name: 'Korty Skra',
    address: 'Wawelska 5, 02-034 Warszawa',
    lat: 52.2145,
    lng: 20.9915,
  },
  {
    name: 'Padel Club Wilanów',
    address: 'Klimczaka 1, 02-797 Warszawa',
    lat: 52.1615,
    lng: 21.0693,
  },
];

export const FOCUS_AREAS = [
  'Serwis',
  'Forehand topspin',
  'Backhand jednoręczny',
  'Wolej',
  'Praca nóg',
  'Return',
  'Wybicie z szyby',
  'Bandeja',
  'Vibora',
  'Kondycja',
  'Taktyka gry deblowej',
  'Gra przy siatce',
  'Slice',
  'Smecz',
] as const;

export const EQUIPMENT = [
  'Rakieta testowa (klubowa)',
  'Owijka',
  'Piłki PRO',
  'Drabinka koordynacyjna',
  'Stożki',
  'Guma oporowa',
  'Buty na mączkę',
  'Ochraniacz na łokieć',
] as const;

export const HEALTH_NOTES = [
  'Ból w prawym łokciu — unikać długich serii serwisów.',
  'Słabe kolano po zerwanym więzadle (2023), bez gwałtownych zwrotów.',
  'Astma wysiłkowa — inhalator w torbie, dłuższe przerwy.',
  'Przebyta operacja barku, ograniczony zakres nad głową.',
  'Nawracające naciągnięcie łydki, obowiązkowa rozgrzewka 15 min.',
  'Problemy z kręgosłupem lędźwiowym — bez skłonów z obciążeniem.',
] as const;

export const GENERAL_NOTES = [
  'Woli treningi rano, po pracy jest wypalony.',
  'Zawsze spóźnia się 5-10 minut, warto przypomnieć dzień wcześniej.',
  'Bardzo ambitny, dobrze reaguje na trening interwałowy.',
  'Gra turnieje amatorskie, cel: awans do ligi B.',
  'Przyprowadza czasem partnera do debla.',
  'Płaci zawsze BLIKiem od razu po treningu.',
  'Potrzebuje dużo tłumaczenia techniki, mało powtórek.',
  'Rodzic dzwoni w sprawie terminów, nie klient.',
  'Lubi grać punkty od pierwszej minuty.',
  'Trening odwołuje rzadko, ale zawsze na ostatnią chwilę.',
] as const;

export const SESSION_PLANS = [
  'Rozgrzewka 10 min, serwis płaski + kick, gra punktowa z przewagą returnu.',
  'Praca nóg — drabinka, potem crossy forehand z dojściem do siatki.',
  'Bandeja i vibora z głębi kortu, na koniec 3 gemy sparingowe.',
  'Return po serwisie kick, ustawienie ciała, 4 serie po 12 powtórzeń.',
  'Wolej z półkortu, reakcja na szybkie piłki, mini-tenis.',
  'Taktyka deblowa: zmiana stron, sygnały, gra przy siatce.',
  'Slice backhand jako piłka neutralizująca, potem atak.',
  'Serwis + pierwsza piłka, schemat 1-2, 30 powtórzeń.',
] as const;

export const POST_SESSION_NOTES = [
  'Serwis dużo stabilniejszy, nadal opada łokieć przy kicku.',
  'Świetna energia, ale spadek koncentracji w ostatnich 15 min.',
  'Praca nóg poprawiona, do powtórzenia w przyszłym tygodniu.',
  'Backhand po prostej wciąż w siatkę — skrócić zamach.',
  'Zmęczony po pracy, obniżyliśmy intensywność.',
  'Zrobiliśmy 6 gemów sparingowych, wygrał 4 — duży progres.',
  'Ból łokcia wrócił, skróciliśmy trening do 45 min.',
  'Pierwszy raz wyszła vibora w grze punktowej.',
] as const;

export const PERSONAL_BLOCK_TITLES = [
  'Dentysta',
  'Odbiór dzieci ze szkoły',
  'Przerwa na lunch',
  'Kurs trenerski PZT',
  'Serwis samochodu',
  'Zebranie w klubie',
  'Trening własny',
  'Fizjoterapia',
] as const;

/** Customer-side openers — the first message of a thread. */
export const CUSTOMER_OPENERS = [
  'Hej! Są jeszcze wolne terminy w przyszłym tygodniu?',
  'Cześć, chciałbym umówić trening indywidualny. Jakie masz ceny?',
  'Dzień dobry, polecił mi Pana kolega z klubu. Przyjmuje Pan nowych?',
  'Siema, można wskoczyć jutro rano na kort?',
  'Hej, czy prowadzisz też treningi padla czy tylko tenis?',
  'Dobry, szukam trenera dla żony — początkująca, zero doświadczenia.',
  'Cześć! Ile kosztuje pakiet 10 treningów?',
  'Hej, mam pytanie o odwoływanie treningów — jak to u Ciebie działa?',
] as const;

export const CUSTOMER_FOLLOWUPS = [
  'Super, to biorę ten czwartek o 18.',
  'A da się przełożyć na piątek? Wypadło mi spotkanie.',
  'Ok, płacę BLIKiem po treningu.',
  'Niestety muszę odwołać, złapałem przeziębienie.',
  'Będę 10 minut później, korek na Puławskiej.',
  'Możemy pograć trochę więcej punktów następnym razem?',
  'Dzięki za trening, łokieć dzisiaj nie bolał!',
  'Czy mogę wziąć kolegę na debla?',
  'Kiedy masz najbliższy wolny termin rano?',
  'Przelew poszedł, sprawdź proszę.',
  'A grasz też w weekendy?',
  'Ile trwa jeden trening?',
] as const;

export const BOT_REPLIES = [
  'Cześć! Mam wolne w czwartek 18:00 i w sobotę 9:00. Który pasuje?',
  'Trening indywidualny to 150 zł za 60 minut, kort wliczony w cenę.',
  'Jasne, zapisuję Cię na czwartek 18:00 na Warszawiance. Do zobaczenia!',
  'Odwołanie bezkosztowe do 24h przed treningiem, później liczymy pełną stawkę.',
  'Przełożyłem trening na piątek 17:00. Potwierdzam termin.',
  'Prowadzę tenis i padel. Padel gramy w hali na Postępu.',
  'Pakiet 10 treningów to 1400 zł, ważny 120 dni od zakupu.',
  'Zapisałem, pamiętaj o butach na mączkę.',
  'Niestety w sobotę mam komplet. Proponuję niedzielę 10:00.',
  'Płatność BLIK na 601234567 albo przelew — dane wyślę po treningu.',
] as const;

export const TRAINER_REPLIES = [
  'Jasne, dorzucę więcej gry punktowej.',
  'Widzimy się na korcie, weź drugą koszulkę.',
  'Spoko, przekładamy. Zapisane.',
  'Pamiętaj o rozgrzewce, ostatnio łydka dawała znać.',
  'Dzięki za dziś, dobra robota z serwisem.',
  'Debel jak najbardziej, doliczam 50 zł za drugą osobę.',
  'Mam okienko w poniedziałek 7:00, bierzesz?',
  'Potwierdzam odbiór płatności, dzięki!',
] as const;

export const BROADCAST_TEXTS = [
  'Cześć! W przyszły weekend organizuję turniej deblowy na Warszawiance. Wpisowe 50 zł, zapisy do piątku.',
  'Uwaga — w poniedziałek korty zewnętrzne zamknięte (konserwacja). Treningi przenoszę do hali.',
  'Od października nowy cennik: trening indywidualny 160 zł, pakiet 10 treningów 1500 zł.',
  'Zostały 3 miejsca na obóz weekendowy 12-14 kwietnia. Kto chętny?',
  'Przypominam o płatnościach za wrzesień. BLIK 601234567.',
  'Wakacyjna przerwa 15-29 lipca. Terminy sierpniowe otwieram już teraz.',
  'Nowość: treningi padla we wtorki 20:00 w hali na Postępu. Dwie pary max.',
  'Sylwestrowy trening 31.12 o 10:00 — kto wpada rozładować kalorie?',
] as const;

export const AI_INSTRUCTIONS = [
  'Zawsze pisz po polsku, na Ty, krótko i konkretnie.',
  'Nie umawiaj treningów wcześniej niż 7:00 i później niż 21:00.',
  'Przy pierwszym kontakcie zawsze podaj cenę i długość treningu.',
  'Nie obiecuj zniżek — przekieruj takie pytania do mnie.',
  'Jeśli klient odwołuje mniej niż 24h przed treningiem, przypomnij o pełnej stawce.',
] as const;
