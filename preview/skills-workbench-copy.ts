import type {Locale} from '../content/types';
type Copy={all:string;tools:string;hint:string;evidence:string;reset:string;empty:string;loading:string;scope:string;preview:string};
export const workbenchCopy:Record<Locale,Copy>={
 en:{all:'All disciplines',tools:'Tools',hint:'Choose a discipline. Select a tool to see where it appears in the work.',evidence:'Applied in these projects',reset:'Clear selection',empty:'This toolkit item has no separately linked project example here.',loading:'Preparing the project connections…',scope:'Engineering scope',preview:'Project preview'},
 ar:{all:'كل المجالات',tools:'الأدوات',hint:'اختر مجالًا، ثم أداة لترى المشاريع التي تُستخدم فيها.',evidence:'تطبيقات في هذه المشاريع',reset:'مسح الاختيار',empty:'لا يوجد مثال مشروع مرتبط بهذه الأداة بشكل منفصل هنا.',loading:'جارٍ تجهيز الروابط مع المشاريع…',scope:'النطاق الهندسي',preview:'معاينة المشروع'},
 de:{all:'Alle Bereiche',tools:'Werkzeuge',hint:'Wählen Sie einen Bereich und ein Werkzeug, um die zugehörigen Projekte zu sehen.',evidence:'In diesen Projekten eingesetzt',reset:'Auswahl löschen',empty:'Für dieses Werkzeug ist hier kein separates Projektbeispiel verknüpft.',loading:'Projektverbindungen werden vorbereitet…',scope:'Engineering-Umfang',preview:'Projektvorschau'},
 fr:{all:'Tous les domaines',tools:'Outils',hint:'Choisissez un domaine, puis un outil pour voir les projets associés.',evidence:'Mis en œuvre dans ces projets',reset:'Effacer la sélection',empty:'Aucun exemple de projet distinct n’est associé à cet outil ici.',loading:'Préparation des liens avec les projets…',scope:'Périmètre d’ingénierie',preview:'Aperçu du projet'},
 es:{all:'Todas las áreas',tools:'Herramientas',hint:'Elige un área y una herramienta para ver los proyectos relacionados.',evidence:'Aplicado en estos proyectos',reset:'Borrar selección',empty:'Esta herramienta no tiene aquí un ejemplo de proyecto vinculado por separado.',loading:'Preparando los vínculos con los proyectos…',scope:'Alcance de ingeniería',preview:'Vista previa del proyecto'},
};
/** Same local artwork and canonical32-item order as the approved technical rail. */
export const workbenchArtwork=[
 'nextjs','react','typescript','javascript','tailwindcss','toolbelt-devices',
 'react','flutter','dart','androidstudio','toolbelt-cross-platform',
 'csharp','toolbelt-desktop','dotnetcore','toolbelt-api','supabase','postgresql','toolbelt-database','toolbelt-socket',
 'espressif','cplusplus','toolbelt-bluetooth','toolbelt-nfc','toolbelt-wifi','toolbelt-realtime','toolbelt-pcb','toolbelt-hardware',
 'python','opencv','toolbelt-vision','toolbelt-email','toolbelt-spreadsheet',
] as const;
export const disciplineArtwork=['react','flutter','postgresql','espressif','python'] as const;
