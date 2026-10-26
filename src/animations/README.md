# Animaciones de entrada

entrance.js define los tiempos, el desplazamiento y la curva compartidos. useEntrance conecta el efecto a un contenedor estable mediante useRef. Los grupos brandEntrance y formEntrance son constantes: no se recrean al escribir o validar.

La marca revela primero el símbolo y después Plaris. El onboarding revela subtítulo, progreso, campos y acciones. Los desplazamientos son de 10 px, sin escala ni rebote. El efecto no cambia colores, tipografía o estructura; por eso mantiene el tema de la interfaz donde se use.

El formulario permanece interactivo desde el primer momento. Enfocar o pulsar cualquier elemento muestra el contenido inmediatamente. No se usa inert, bloqueo del scroll ni una capa sobre los campos. Los cambios de prefers-reduced-motion cancelan el movimiento. Al desmontar se cancelan las animaciones y se retiran los listeners.

Para reutilizar: crear una constante de selectores y retrasos, un useRef en la raíz y llamar useEntrance(ref, etapas). No usar claves basadas en valores de inputs ni remontar el formulario para animarlo. El efecto corre al montar la pantalla; navegar entre pasos del mismo onboarding no reinicia la secuencia.

## Entrada solo con símbolo

SymbolIntro utiliza la misma imagen SVG que BrandMark, definida en brandIntro.js. Tras precargarla, aparece durante 300 ms, da un brinco y gira 360 grados. A los 1750 ms comienza a acomodarse en el encabezado durante 750 ms, mientras desaparece el fondo blanco. La secuencia dura 2.5 segundos. El destino se mide justo antes del movimiento; se conservan las salidas por movimiento reducido, Escape y errores de carga.

El fondo se configura con la propiedad background de SymbolIntro (por defecto #ffffff). La imagen está en public/images/plaris-symbol.svg y utiliza los colores #2eb6aa y #105f56. El nombre Plaris permanece estático. No se añaden animaciones a formularios ni contenido. Movimiento reducido, Escape, scroll o cambio de tamaño muestran directamente la marca final. Los errores de carga también retiran la capa; al desmontar se cancelan las animaciones y se limpian los eventos.

El efecto comienza en useEffect, cuando la referencia del contenedor padre y el encabezado ya están conectadas. Suspense envuelve únicamente el Outlet en AppLayout: la carga de las páginas no desmonta ni sustituye la introducción y la navegación.

La entrada normal es tranquila: el logo aparece y se acomoda sin brinco ni giro. Si el contenido sigue cargando tras la espera inicial, se repite el ciclo de brinco y giro hasta que esté listo.
