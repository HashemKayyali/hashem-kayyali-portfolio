import type {Locale} from '../content/types';
type Copy={caption:string;alt:string};
const L=(en:Copy,ar:Copy,de:Copy,fr:Copy,es:Copy):Record<Locale,Copy>=>({en,ar,de,fr,es});
/** The Terminal Simulator Control: promotional cover first, then real admin-dashboard crops (exact pixel regions of owner-supplied screenshots, demo/test data). */
export const TERMINAL_COVER='/covers/terminal-nfc.webp';
export const TERMINAL_SHOTS=[
 '/v2-media/terminal-sim-01-1283.webp','/v2-media/terminal-sim-02-1440.webp','/v2-media/terminal-sim-03-670.webp',
 '/v2-media/terminal-sim-04-670.webp','/v2-media/terminal-sim-05-266.webp','/v2-media/terminal-sim-06-1440.webp',
];
export const terminalEvidence:Record<string,Record<Locale,Copy>>={
 [TERMINAL_COVER]:L(
  {caption:'Promotional artwork · an illustrative composition, not an exact screenshot of the system',alt:'Promotional artwork for The Terminal Simulator Control showing the admin dashboard on desktop, tablet and phone.'},
  {caption:'عمل ترويجي · تكوين توضيحي وليس لقطة شاشة دقيقة للنظام',alt:'عمل ترويجي لـ The Terminal Simulator Control يعرض لوحة الإدارة على سطح المكتب والجهاز اللوحي والهاتف.'},
  {caption:'Werbegrafik · eine illustrative Komposition, kein exakter Screenshot des Systems',alt:'Werbegrafik für The Terminal Simulator Control mit dem Admin-Dashboard auf Desktop, Tablet und Smartphone.'},
  {caption:'Visuel promotionnel · composition illustrative, et non une capture d’écran exacte du système',alt:'Visuel promotionnel de The Terminal Simulator Control montrant le tableau de bord d’administration sur ordinateur, tablette et téléphone.'},
  {caption:'Imagen promocional · composición ilustrativa, no una captura exacta del sistema',alt:'Imagen promocional de The Terminal Simulator Control con el panel de administración en escritorio, tableta y teléfono.'}),
 [TERMINAL_SHOTS[0]]:L(
  {caption:'Simulator workspace · current operation, readiness and the paired main control PC (demo data)',alt:'Simulator workspace of the admin dashboard showing the current operation, the paired main control PC and the recommended next action for one simulator.'},
  {caption:'مساحة المحاكي · العملية الحالية والجاهزية وجهاز التحكم الرئيسي المقترن (بيانات تجريبية)',alt:'مساحة المحاكي في لوحة الإدارة تعرض العملية الحالية وجهاز التحكم الرئيسي المقترن والخطوة التالية المقترحة لمحاكٍ واحد.'},
  {caption:'Simulator-Arbeitsbereich · aktueller Betrieb, Bereitschaft und gekoppelter Hauptsteuerungs-PC (Demodaten)',alt:'Simulator-Arbeitsbereich des Admin-Dashboards mit aktuellem Betrieb, gekoppeltem Hauptsteuerungs-PC und empfohlener nächster Aktion für einen Simulator.'},
  {caption:'Espace simulateur · opération en cours, état de préparation et PC de contrôle principal appairé (données de démonstration)',alt:'Espace simulateur du tableau de bord d’administration montrant l’opération en cours, le PC de contrôle principal appairé et l’action recommandée pour un simulateur.'},
  {caption:'Espacio del simulador · operación actual, preparación y PC de control principal emparejado (datos de demostración)',alt:'Espacio del simulador en el panel de administración con la operación actual, el PC de control principal emparejado y la acción recomendada para un simulador.'}),
 [TERMINAL_SHOTS[1]]:L(
  {caption:'Main control PC · Windows client status and linked simulators (demo data)',alt:'Main control PC page showing the Windows client pairing status and the simulators linked to that PC.'},
  {caption:'جهاز التحكم الرئيسي · حالة عميل ويندوز والمحاكيات المرتبطة (بيانات تجريبية)',alt:'صفحة جهاز التحكم الرئيسي تعرض حالة اقتران عميل ويندوز والمحاكيات المرتبطة بهذا الجهاز.'},
  {caption:'Hauptsteuerungs-PC · Status des Windows-Clients und verknüpfte Simulatoren (Demodaten)',alt:'Seite eines Hauptsteuerungs-PCs mit dem Kopplungsstatus des Windows-Clients und den verknüpften Simulatoren.'},
  {caption:'PC de contrôle principal · état du client Windows et simulateurs liés (données de démonstration)',alt:'Page d’un PC de contrôle principal indiquant l’état d’appairage du client Windows et les simulateurs liés à ce PC.'},
  {caption:'PC de control principal · estado del cliente Windows y simuladores vinculados (datos de demostración)',alt:'Página de un PC de control principal con el estado de emparejamiento del cliente Windows y los simuladores vinculados.'}),
 [TERMINAL_SHOTS[2]]:L(
  {caption:'Guided setup · four steps: main control PC, motion sensor, calibration and activation (demo data)',alt:'Readiness panel listing four completed setup steps: main control PC, motion sensor, calibration and activation.'},
  {caption:'الإعداد الموجَّه · أربع خطوات: جهاز التحكم الرئيسي وحساس الحركة والمعايرة والتفعيل (بيانات تجريبية)',alt:'لوحة الجاهزية تسرد أربع خطوات إعداد مكتملة: جهاز التحكم الرئيسي وحساس الحركة والمعايرة والتفعيل.'},
  {caption:'Geführte Einrichtung · vier Schritte: Hauptsteuerungs-PC, Bewegungssensor, Kalibrierung und Aktivierung (Demodaten)',alt:'Bereitschaftsanzeige mit vier abgeschlossenen Einrichtungsschritten: Hauptsteuerungs-PC, Bewegungssensor, Kalibrierung und Aktivierung.'},
  {caption:'Configuration guidée · quatre étapes : PC de contrôle principal, capteur de mouvement, calibrage et activation (données de démonstration)',alt:'Panneau de préparation listant quatre étapes de configuration terminées : PC de contrôle principal, capteur de mouvement, calibrage et activation.'},
  {caption:'Configuración guiada · cuatro pasos: PC de control principal, sensor de movimiento, calibración y activación (datos de demostración)',alt:'Panel de preparación con cuatro pasos de configuración completados: PC de control principal, sensor de movimiento, calibración y activación.'}),
 [TERMINAL_SHOTS[3]]:L(
  {caption:'Motion sensor and calibration · pairing, verification and calibration status (demo data)',alt:'Motion sensor panel with its binding and status, and a calibration panel showing motion verification on and two of two tests.'},
  {caption:'حساس الحركة والمعايرة · حالة الاقتران والتحقق والمعايرة (بيانات تجريبية)',alt:'لوحة حساس الحركة مع ارتباطه وحالته، ولوحة المعايرة التي تعرض تفعيل التحقق من الحركة واجتياز اختبارين من اثنين.'},
  {caption:'Bewegungssensor und Kalibrierung · Kopplungs-, Verifizierungs- und Kalibrierstatus (Demodaten)',alt:'Bewegungssensor-Bereich mit Bindung und Status sowie Kalibrierbereich mit aktivierter Bewegungsverifizierung und zwei von zwei Tests.'},
  {caption:'Capteur de mouvement et calibrage · état d’appairage, de vérification et de calibrage (données de démonstration)',alt:'Panneau du capteur de mouvement avec son association et son état, et panneau de calibrage indiquant la vérification du mouvement activée et deux tests sur deux.'},
  {caption:'Sensor de movimiento y calibración · estado de emparejamiento, verificación y calibración (datos de demostración)',alt:'Panel del sensor de movimiento con su vinculación y estado, y panel de calibración con la verificación de movimiento activada y dos de dos pruebas.'}),
 [TERMINAL_SHOTS[4]]:L(
  {caption:'Mobile layout · the same simulator workspace on a phone, in Arabic (demo data)',alt:'Simulator workspace on a phone in Arabic, showing the current operation and the setup steps.'},
  {caption:'العرض على الهاتف · مساحة المحاكي نفسها على الهاتف بالعربية (بيانات تجريبية)',alt:'مساحة المحاكي على الهاتف بالعربية تعرض العملية الحالية وخطوات الإعداد.'},
  {caption:'Mobile Ansicht · derselbe Simulator-Arbeitsbereich auf dem Smartphone, auf Arabisch (Demodaten)',alt:'Simulator-Arbeitsbereich auf dem Smartphone auf Arabisch mit aktuellem Betrieb und Einrichtungsschritten.'},
  {caption:'Affichage mobile · le même espace simulateur sur téléphone, en arabe (données de démonstration)',alt:'Espace simulateur sur téléphone, en arabe, avec l’opération en cours et les étapes de configuration.'},
  {caption:'Vista móvil · el mismo espacio del simulador en un teléfono, en árabe (datos de demostración)',alt:'Espacio del simulador en un teléfono, en árabe, con la operación actual y los pasos de configuración.'}),
 [TERMINAL_SHOTS[5]]:L(
  {caption:'Loyverse reconciliation · simulator usage compared with sales; demo data, not production transactions',alt:'Loyverse reconciliation page with a demo-data notice, connection status, setup attention items and overall counts comparing simulator units with sold units.'},
  {caption:'مطابقة لويفيرس · مقارنة استخدام المحاكيات بالمبيعات؛ بيانات تجريبية وليست معاملات فعلية',alt:'صفحة مطابقة لويفيرس مع تنبيه البيانات التجريبية وحالة الاتصال وبنود الإعداد المطلوبة والأعداد الإجمالية التي تقارن وحدات المحاكيات بالوحدات المباعة.'},
  {caption:'Loyverse-Abgleich · Simulatornutzung im Vergleich zu Verkäufen; Demodaten, keine Produktivtransaktionen',alt:'Loyverse-Abgleich mit Demodaten-Hinweis, Verbindungsstatus, offenen Einrichtungspunkten und Gesamtzahlen, die Simulatoreinheiten mit verkauften Einheiten vergleichen.'},
  {caption:'Rapprochement Loyverse · usage des simulateurs comparé aux ventes ; données de démonstration, pas des transactions réelles',alt:'Page de rapprochement Loyverse avec mention de données de démonstration, état de connexion, points de configuration à traiter et totaux comparant les unités simulateur aux unités vendues.'},
  {caption:'Conciliación con Loyverse · uso de los simuladores frente a las ventas; datos de demostración, no transacciones reales',alt:'Página de conciliación con Loyverse con aviso de datos de demostración, estado de conexión, puntos de configuración pendientes y totales que comparan las unidades de simulador con las vendidas.'}),
};
