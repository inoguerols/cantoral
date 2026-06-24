# Derechos de autor y licencias — Cantoral

> Información general para orientar, **no es asesoramiento jurídico**. Ante la duda,
> consulta con cada autor/editorial o con la asesoría de tu diócesis.

## El principio básico

El derecho de autor protege **la letra y el arreglo musical** de una canción, se gane
dinero o no. Publicar una letra con acordes en una web es **reproducción** + **comunicación
pública** (puesta a disposición), y ambos son derechos exclusivos del autor/editorial.
Que la app sea **gratuita y sin ánimo de lucro NO la hace legal**: el "sin ánimo de lucro"
solo reduce la gravedad y las indemnizaciones, no sustituye el permiso.

Por eso Cantoral aplica el **modelo de acceso** (campo `access` en cada canción):

- **`public`** — visible para cualquiera, sin sesión. Reservado a **dominio público** o a
  obras con **licencia/permiso** expreso.
- **`members`** (por defecto) — visible solo para usuarios **registrados** de la parroquia.
  Reduce mucho la exposición; es donde van las obras con copyright mientras no haya licencia.

Además, las **letras nunca se guardan en el repositorio público** (están en `.gitignore`):
viven solo en tu base de datos Supabase.

## Catálogo del "Triduo Pascual — Pastoral UGR" y estado de derechos

Marca por defecto recomendada entre paréntesis. "Verificar autor" = atribución probable, a
confirmar con la fuente antes de tratarla como pública.

### Dominio público (candidatas a `public`)
| Canción | Base | Estado |
|---|---|---|
| Tantum Ergo | Texto de Sto. Tomás de Aquino + melodía gregoriana | **Dominio público** |
| Regina Coeli | Antífona mariana latina tradicional + gregoriano | **Dominio público** |
| Ubi caritas | Texto latino tradicional (PD) | PD **solo si** la melodía es gregoriana; si es la de Taizé (J. Berthier) → copyright |
| "Santo" (nacho pastoral) | Sanctus litúrgico; melodía local | PD si la melodía es **propia** de la pastoral (confírmalo) |

### Con copyright (mantener en `members` salvo licencia)
| Canción | Autor/editorial probable | Acción |
|---|---|---|
| Danos un solo corazón (Entrada) | Juan A. Espinosa | Pedir licencia |
| Si no tengo amor (Himno a la caridad) | Melodía moderna (verificar) | Pedir licencia |
| Pan y vino / "Sigue habiendo tantos pies que lavar" | Verificar autor | Pedir licencia |
| Getsemaní / "Tierra fría, te siento…" (Comunión) | Brotes de Olivo | Pedir licencia |
| Amando hasta el extremo / "Déjame Señor mirarte…" | Brotes de Olivo | Pedir licencia |
| Tomad y comed / "Quiero alcanzar el cielo…" | Verificar autor | Pedir licencia |
| Vengo aquí mi Señor | Verificar (estilo Kairoi) | Pedir licencia |
| Noche / "Por tu Iglesia que te espera…" (Hora Santa) | Verificar | Pedir licencia |
| No sé qué viste en mí | Ixcís | Pedir licencia |
| Todo está en tu adentro | Verificar | Pedir licencia |
| Al amor más sincero | Verificar | Pedir licencia |
| Madre (Vía Crucis XIII) | Brotes de Olivo (verificar) | Pedir licencia |
| Y te caes (Vía Crucis VII) | Verificar | Pedir licencia |
| ¿Por qué? / Mi Cristo roto (Vía Crucis IX) | Verificar | Pedir licencia |
| La medida del amor (Vía Crucis XI) | Brotes de Olivo | Pedir licencia |
| Diario de María | **Martín Valverde** | Pedir licencia |
| Pregón Pascual / Exsultet (melodía "Kiko") | Texto: traducción litúrgica oficial (CEE); melodía: Kiko Argüello | Pedir licencia (doble) |
| Salmos responsoriales (Sal 103, Éx 15, "Como busca la cierva"…) | Traducciones litúrgicas oficiales (CEE) + melodías | Pedir licencia |
| En comunidad / "Cuando veo un mundo gris…" | Verificar | Pedir licencia |
| Resucitó | **Kiko Argüello** (Camino Neocatecumenal) | Pedir licencia |
| Aleluya de la tierra / "El que sufre…" | Verificar | Pedir licencia |
| Cristo Luz / "Vale la pena dejarse llevar…" | Verificar | Pedir licencia |
| (Extra: Culpable–Ixcís, Confiaré–Amparo Navarro, Nadie te ama como yo, etc.) | Varias | Sin letra en el PDF: no se cargan |

> La mayoría del repertorio es **moderno y con derechos**. Trátalo como `members` hasta
> tener permiso/licencia.

## Cómo pedir licencia (España)

1. **SGAE** — gestiona los derechos de comunicación pública y reproducción de la mayoría de
   autores españoles. Pregunta por la licencia de **uso en internet** y la tarifa para
   entidades religiosas/no lucrativas. (sgae.es)
2. **OneLicense / LicenSing** — licencias para reproducir letras y partituras de muchas
   editoriales litúrgicas (hojas, proyección). Confirma que su cobertura incluye **web**.
3. **Editoriales/autores directamente** — para repertorio concreto:
   - *Brotes de Olivo* (Hermanos Martínez) — varias canciones del Vía Crucis y comunión.
   - *Kiko Argüello / Camino Neocatecumenal* — Resucitó, Pregón.
   - *Martín Valverde* — Diario de María (a través de su editorial/discográfica).
   - *Ixcís*, *Kairoi*, *Ain Karem*, *Amparo Navarro* — webs de cada grupo.
   - Cantorales: *San Pablo*, *PPC*, *Verbo Divino*.
   Pide por escrito permiso de **uso no comercial en web restringida a la comunidad
   parroquial**; muchos lo conceden.
4. **Textos litúrgicos oficiales** (Exsultet, salmos del Leccionario, ordinario de la Misa):
   derechos de la **Conferencia Episcopal Española** (Departamento de Liturgia) / editorial
   litúrgica. Pídelos aparte.
5. **CEDRO** — si necesitas cubrir reproducción de texto impreso.
6. **Diócesis** — algunas tienen licencias marco; pregunta a tu vicaría/secretaría.

## Recomendación práctica

- Sube TODO como `members` por defecto (ya es el valor por defecto).
- Marca `public` solo lo de **dominio público** verificado o lo que tengas **por escrito**.
- Cuando consigas una licencia, anota su referencia y cambia esa canción a `public` si la
  licencia cubre acceso abierto.
- Adjunta el **PDF original** a cada canción como fuente de referencia.
