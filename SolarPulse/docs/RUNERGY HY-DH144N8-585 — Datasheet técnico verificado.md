# RUNERGY HY-DH144N8-585 — Datasheet técnico verificado

**Fabricante:** RUNERGY / Jiangsu Runergy New Energy Technology Co., Ltd.  
**Modelo identificado en la etiqueta:** `HY-DH144N8-585`  
**Tipo de módulo:** módulo fotovoltaico bifacial N-Type, 144 células, doble vidrio  
**Potencia nominal:** 585 W  
**Documento:** recopilación técnica basada en la etiqueta física del módulo suministrada por el usuario y en documentación oficial publicada por RUNERGY.

&gt; **Criterio de verificación:** se prioriza la etiqueta física del módulo para los datos que identifican específicamente esta unidad y la documentación oficial de RUNERGY para las características del modelo. Cuando existen revisiones distintas de la familia HY-DH144N8, se indica explícitamente la revisión y no se mezclan especificaciones entre variantes.

---

## 1. Identificación de la unidad

| Campo | Valor verificado | Fuente |
|---|---:|---|
| Fabricante | RUNERGY | Etiqueta física + documentación oficial |
| Modelo | **HY-DH144N8-585** | Etiqueta física |
| Potencia máxima nominal, Pmax | **585 W** | Etiqueta física + ficha oficial |
| Tecnología de célula | Mono N-Type, 182 mm | Ficha oficial RUNERGY |
| Número de células | **144 (6 × 24)** | Ficha oficial RUNERGY |
| Arquitectura | Bifacial, doble vidrio | Ficha oficial RUNERGY |
| Bifacialidad indicada en la etiqueta | **80% ±5%** | Etiqueta física |
| Tensión máxima del sistema | **1500 V DC** | Etiqueta física + ficha oficial |
| Fusible máximo en serie | **30 A** | Etiqueta física + ficha oficial |
| Clase de seguridad | **Class II** | Etiqueta física |
| Resistencia al fuego | **UL Type 29** | Etiqueta física + ficha oficial |
| Temperatura de operación | **−40 °C a +85 °C** | Etiqueta física + ficha oficial |
| Fabricación indicada en la etiqueta | **Assembled in USA** | Etiqueta física |

---

# 2. Características eléctricas en STC

La etiqueta especifica explícitamente **STC: AM1.5, 1000 W/m², 25 °C**.

| Parámetro | Valor |
|---|---:|
| Potencia máxima, Pmax | **585 W** |
| Tensión en Pmax, Vmp | **44.22 V** |
| Corriente en Pmax, Imp | **13.23 A** |
| Tensión de circuito abierto, Voc | **52.16 V** |
| Corriente de cortocircuito, Isc | **13.85 A** |
| Eficiencia del módulo | **22.6 %** |
| Tolerancia de potencia indicada en etiqueta | **±3 %** |
| Tolerancia de Voc indicada en etiqueta | **±3 %** |
| Tolerancia de Isc indicada en etiqueta | **±4 %** |

### Observación importante sobre la tolerancia de potencia

La **etiqueta física de esta unidad** indica `Max Power Tolerance: ±3%`.

Las fichas globales posteriores de RUNERGY para la familia HY-DH144N8-585 muestran una especificación diferente: **0 a +5 W** para la potencia nominal y una incertidumbre de medición de Pmax de ±3 %. Por tanto, para esta unidad concreta debe conservarse como dato de identificación la tolerancia que aparece físicamente en su etiqueta (**±3 %**), mientras que `0 ~ +5 W` pertenece a una revisión de ficha técnica posterior y no debe sustituirse automáticamente en la etiqueta de este panel.

---

# 3. Valores STC publicados por RUNERGY para la versión HY-DH144N8-585

La ficha oficial de RUNERGY de la familia HY-DH144N8 570–595 W proporciona los siguientes valores para el bin de 585 W:

| Parámetro | 585 W |
|---|---:|
| Pmax | **585 W** |
| Vmp | **44.22 V** |
| Imp | **13.23 A** |
| Voc | **52.16 V** |
| Isc | **13.85 A** |
| Eficiencia | **22.6 %** |

**Condiciones STC:** irradiancia 1000 W/m², temperatura de célula 25 °C, AM1.5.

---

# 4. Características eléctricas en NMOT

La ficha oficial RUNERGY proporciona estos valores para condiciones NMOT:

**Condiciones:** irradiancia 800 W/m², temperatura ambiente 20 °C, AM1.5 y velocidad de viento de 1 m/s.

| Parámetro | 585 W |
|---|---:|
| Pmax | **448.1 W** |
| Vmp | **42.34 V** |
| Imp | **10.58 A** |
| Voc | **49.94 V** |
| Isc | **11.16 A** |

&gt; NMOT no significa que el panel produzca siempre 448.1 W. Es un punto de referencia bajo las condiciones de prueba especificadas.

---

# 5. Coeficientes de temperatura

La ficha oficial RUNERGY para esta familia especifica:

| Parámetro | Coeficiente |
|---|---:|
| Coeficiente de Pmax | **−0.29 %/°C** |
| Coeficiente de Voc | **−0.25 %/°C** |
| Coeficiente de Isc | **+0.045 %/°C** |
| Temperatura nominal de operación del módulo | **42 ±2 °C** |
| Temperatura nominal de operación de célula | **45 ±2 °C** |

### Interpretación técnica

- El **Pmax disminuye** cuando aumenta la temperatura.
- El **Voc disminuye** con la temperatura.
- El **Isc aumenta ligeramente** con la temperatura.
- Para dimensionar strings, el dato crítico en condiciones frías es normalmente **Voc**, porque aumenta al bajar la temperatura.

El cálculo de tensión de circuito abierto a temperaturas distintas de la condición de referencia debe hacerse con el coeficiente correspondiente y la temperatura de célula, no simplemente con la temperatura ambiente.

---

# 6. Bifacialidad

La etiqueta física del módulo indica:

**Bifaciality: 80% ±5%**

Las fichas oficiales RUNERGY más recientes de la familia HY-DH144N8 también especifican **80% ±5%**.

Esto significa que la respuesta eléctrica de la cara posterior está relacionada con la de la cara frontal, pero **no significa que el panel produzca automáticamente un 80% adicional de potencia**.

La ganancia energética real por la cara posterior depende, entre otros factores, de:

- irradiancia disponible detrás del módulo;
- reflectividad del terreno/albedo;
- altura del módulo;
- separación entre filas;
- geometría de montaje;
- sombreado;
- orientación e inclinación;
- condiciones de suciedad y entorno.

RUNERGY publica, para el módulo de referencia de 585 W, ejemplos de potencia combinada con determinadas ganancias posteriores:

| Ganancia trasera | Pmax publicada |
|---:|---:|
| 5 % | **614 W** |
| 15 % | **673 W** |
| 25 % | **731 W** |

Estos valores son **escenarios de referencia del fabricante**, no una potencia garantizada de funcionamiento.

---

# 7. Parámetros mecánicos de la familia HY-DH144N8

La documentación oficial de RUNERGY existe en distintas revisiones. La revisión global 2025 Q4 para HY-DH144N8 580–600 W especifica una construcción de 30 mm, mientras que una ficha estadounidense anterior para HY-DH144N8 565–585 W especifica 35 mm.

Por ello, **no debe asumirse el grosor físico de una unidad concreta sin medirla o verificar la ficha correspondiente al lote**.

## Características comunes verificadas

| Parámetro | Valor |
|---|---:|
| Longitud | **2278 ±2 mm** |
| Anchura | **1134 ±2 mm** |
| Tipo de célula | Mono N-Type, 182 mm |
| Número de células | **144 (6 × 24)** |
| Caja de conexiones | **IP68** |
| Diodos bypass | **3** |
| Cable | **4 mm² (IEC), 12 AWG (UL)** |
| Longitud de cable publicada | **+400 / −200 mm**, o personalizada |
| Conector | **RY01 o similar** |
| Tensión máxima del sistema | **1500 V DC** |
| Fusible máximo | **30 A** |
| Carga frontal máxima publicada | **5400 Pa** |
| Carga trasera máxima publicada | **2400 Pa** |
| Resistencia al fuego | **IEC Class A / UL Type 29** |

---

# 8. Construcción

Para la revisión global de 30 mm publicada por RUNERGY:

- Célula: **mono N-Type de 182 mm**
- Número de células: **144 (6 × 24)**
- Cubierta frontal: **vidrio de 2.0 mm con recubrimiento AR y reforzado térmicamente**
- Cubierta posterior: **vidrio de 2.0 mm reforzado térmicamente**
- Marco: **aluminio anodizado color plata**
- Caja de conexiones: **IP68**
- Diodos bypass: **3**

Para la revisión estadounidense de 35 mm publicada por RUNERGY:

- Dimensiones: **2278 × 1134 × 35 mm**
- Peso publicado: **32.7 kg**
- Vidrio frontal: **2.0 mm, semi-templado con tratamiento AR**
- Vidrio posterior: **2.0 mm, semi-templado**

La diferencia entre estas fichas demuestra que **el espesor de 30/35 mm y el peso no deben atribuirse a la unidad concreta solo por conocer el modelo HY-DH144N8-585**.

---

# 9. Etiqueta eléctrica de la unidad fotografiada

Transcripción de los datos visibles en la fotografía:

```text
RUNERGY

Module Type: HY-DH144N8-585
Rated Max Power (Pmax): 585W
Voltage at Pmax (Vmp): 44.22V
Current at Pmax (Imp): 13.23A
Open-Circuit Voltage (Voc): 52.16V
Short-Circuit Current (Isc): 13.85A
Max Power Tolerance: ±3%
Open Circuit Voltage Tolerance: ±3%

Short Circuit Current Tolerance: ±4%
Max System Voltage: 1500V
Max Series Fuse Rating: 30A
Safety Class: Class II
Fire Resistance: UL Type 29
Operating Temperature: -40°C ~ +85°C
Bifaciality: 80% ±5%

STC: AM1.5, 1000W/m², 25°C

Conforms to UL Std.
UL61730-1/-2

Certified to CSA Std.
C22.2#61730-1/-2

Assembled in USA
```

La fotografía también muestra una indicación de cableado que especifica **12 AWG de cobre**, con aislamiento para una temperatura mínima de **90 °C**, apto para condiciones húmedas y resistente a radiación UV cuando está expuesto.

---

# 10. Certificaciones y normas visibles

La etiqueta identifica:

- **UL 61730-1/-2**
- **CSA C22.2#61730-1/-2**
- **UL Type 29**
- **Safety Class II**
- Marcado **CE**

La presencia del texto en la etiqueta confirma que esas referencias forman parte del marcado de la unidad fotografiada. La etiqueta por sí sola no debe utilizarse para inferir cualquier otra certificación no indicada.

---

# 11. Parámetros de corriente y tensión útiles para diseño

## Punto de máxima potencia

A STC:

- Vmp = **44.22 V**
- Imp = **13.23 A**
- Pmax = **585 W**

La comprobación matemática:

`44.22 V × 13.23 A ≈ 585.03 W`

La pequeña diferencia frente a 585 W se debe al redondeo de los valores impresos.

## Circuito abierto

- Voc = **52.16 V**
- Isc = **13.85 A**

Estos valores son fundamentales para el dimensionamiento de reguladores MPPT, inversores y strings.

**No debe utilizarse Vmp como sustituto de Voc para comprobar el límite máximo de tensión de un equipo.**

---

# 12. Área y densidad de potencia

Usando las dimensiones nominales 2278 × 1134 mm:

**Área aproximada:**

`2.278 m × 1.134 m = 2.583 m²`

Con 585 W nominales:

`585 W / 2.583 m² ≈ 226.5 W/m²`

Esto es un cálculo derivado a partir de las dimensiones publicadas, no un valor impreso por RUNERGY en la etiqueta.

---

# 13. Comportamiento térmico aproximado

A partir del coeficiente oficial de Pmax de −0.29 %/°C, la variación relativa aproximada de potencia respecto a 25 °C de célula puede expresarse como:

`P(T) ≈ 585 × [1 − 0.0029 × (T − 25)]`

Ejemplos puramente matemáticos:

| Temperatura de célula | Pmax aproximada |
|---:|---:|
| 25 °C | 585 W |
| 35 °C | ~568 W |
| 45 °C | ~551 W |
| 55 °C | ~534 W |
| 65 °C | ~517 W |
| 75 °C | ~500 W |

Estos valores son **estimaciones calculadas**, no valores garantizados por RUNERGY. La temperatura de célula no debe confundirse con la temperatura ambiente.

---

# 14. Dimensionamiento de strings: advertencia importante

El panel tiene:

- Voc STC = **52.16 V**
- Sistema máximo = **1500 V DC**

No es correcto calcular simplemente `1500 / 52.16` y usar ese número como cantidad máxima de paneles en serie.

Para un diseño real deben considerarse:

1. **Voc a la temperatura mínima de célula del lugar**.
2. Coeficiente de temperatura de Voc = **−0.25 %/°C**.
3. Tensión máxima permitida por el inversor/MPPT.
4. Rango MPPT del inversor.
5. Corriente máxima admitida por el MPPT.
6. Normativa eléctrica aplicable.
7. Condiciones específicas de instalación.

El cálculo debe realizarse con la **temperatura mínima de diseño**, porque el Voc aumenta al disminuir la temperatura.

---

# 15. Límites de protección y compatibilidad

| Especificación | Valor |
|---|---:|
| Máxima tensión de sistema | **1500 V DC** |
| Fusible máximo en serie | **30 A** |
| Caja de conexiones | **IP68** |
| Diodos bypass | **3** |
| Temperatura de operación | **−40 a +85 °C** |
| Carga frontal | **5400 Pa** |
| Carga posterior | **2400 Pa** |
| Clase de seguridad | **Class II** |
| Fire resistance | **UL Type 29** |

El valor de **30 A es el máximo rating de fusible en serie indicado por el fabricante**, no una recomendación de instalar un fusible de 30 A en cualquier configuración.

---

# 16. Información que NO debe darse por confirmada para esta unidad

Para evitar mezclar revisiones de producto, los siguientes datos **no se consideran confirmados específicamente para el panel fotografiado** sin información adicional de lote/serie o inspección física:

- peso exacto;
- grosor exacto del marco (30 mm frente a 35 mm);
- tipo exacto de conector instalado;
- longitud real de los cables;
- número de lote;
- número de serie;
- fecha de fabricación;
- país exacto de fabricación de células;
- fabricante exacto de las células;
- garantía aplicable al propietario concreto;
- degradación histórica de una unidad usada;
- estado eléctrico actual;
- potencia real actual;
- resistencia de aislamiento;
- estado de los diodos bypass;
- microfisuras;
- PID/LID/LeTID sufrido por una unidad concreta.

La etiqueta indica **“Assembled in USA”**, pero eso no permite por sí solo afirmar el origen de cada componente del módulo.

---

# 17. Sobre las diferentes revisiones de HY-DH144N8

Se localizaron varias fichas oficiales de RUNERGY para la misma familia:

### Revisión anterior 560–585 W

RUNERGY publicó una versión `HY-DH144N8-560/585` con:

- 2278 × 1134 × 35 mm
- 32.7 kg
- 80% ±10% de bifacialidad
- 585 W: 42.74 V / 13.69 A / 51.67 V / 14.43 A

**No corresponde a los valores eléctricos de la etiqueta fotografiada**, por lo que no debe utilizarse para describir esta unidad.

### Revisión 570–595 W

Las fichas oficiales posteriores de RUNERGY para la familia HY-DH144N8 especifican para 585 W:

- 44.22 V Vmp
- 13.23 A Imp
- 52.16 V Voc
- 13.85 A Isc
- 22.6% de eficiencia
- 80% ±5% de bifacialidad

Estos valores coinciden con la etiqueta fotografiada.

### Revisión 580–600 W

La ficha global 2025 Q4 mantiene para el bin de 585 W los mismos valores eléctricos principales, pero presenta una construcción de 30 mm y 32 kg.

**Conclusión:** el nombre `HY-DH144N8-585` por sí solo no basta para determinar todas las características mecánicas de un panel fabricado en una revisión concreta.

---

# 18. Resumen técnico de la unidad identificada

| Categoría | Especificación |
|---|---|
| **Modelo** | **HY-DH144N8-585** |
| **Potencia** | **585 W** |
| **Tecnología** | **N-Type monocristalino** |
| **Células** | **144 (6 × 24), 182 mm** |
| **Bifacialidad de etiqueta** | **80% ±5%** |
| **Vmp** | **44.22 V** |
| **Imp** | **13.23 A** |
| **Voc** | **52.16 V** |
| **Isc** | **13.85 A** |
| **Eficiencia** | **22.6%** |
| **Sistema máximo** | **1500 V DC** |
| **Fusible máximo** | **30 A** |
| **Temperatura** | **−40 a +85 °C** |
| **Coef. Pmax** | **−0.29%/°C** |
| **Coef. Voc** | **−0.25%/°C** |
| **Coef. Isc** | **+0.045%/°C** |
| **NMOT** | **42 ±2 °C** |
| **NOCT / temperatura nominal de célula** | **45 ±2 °C** |
| **Caja de conexiones** | **IP68, 3 bypass diodes** |
| **Dimensiones nominales de la familia** | **2278 × 1134 mm** |
| **Carga frontal publicada** | **5400 Pa** |
| **Carga posterior publicada** | **2400 Pa** |
| **Normas visibles** | **UL 61730-1/-2, CSA C22.2#61730-1/-2** |
| **Fire resistance** | **UL Type 29** |
| **Clase de seguridad** | **Class II** |
| **Marcado de fabricación de la unidad** | **Assembled in USA** |

---

# 19. Fuentes consultadas

## Fuentes primarias: RUNERGY

1. **RUNERGY — HY-DH144N8 570–595 W, Global, revisión 2025**
   - Ficha técnica oficial con características STC, NMOT, bifacialidad, temperatura, construcción y cargas.

2. **RUNERGY — HY-DH144N8 580–600 W, Global, revisión 2025 Q4**
   - Ficha técnica oficial que conserva los valores eléctricos del bin de 585 W y documenta la revisión mecánica de 30 mm.

3. **RUNERGY — HY-DH144N8 565–585 W, US**
   - Ficha estadounidense anterior, útil para identificar las diferencias entre revisiones de 35 mm y 30 mm.

4. **RUNERGY — página oficial de módulos N-Type**
   - Confirma que HY-DH144N8 pertenece a la familia N-Type de módulos de RUNERGY.

## Fuente independiente de verificación

5. **California Energy Commission — Solar Equipment List**
   - Registra específicamente `Jiangsu Runergy New Energy Technology Co., Ltd — HY-DH144N8-585`, 585 W, 144 células, 1500 V y certificación UL 61730.

---

# 20. Conclusión

La unidad fotografiada puede identificarse con alto grado de confianza como un **RUNERGY HY-DH144N8-585 de 585 W**.

Los valores eléctricos principales de la etiqueta coinciden con la ficha oficial RUNERGY de la familia 570–595 W:

**585 W / 44.22 V / 13.23 A / 52.16 V / 13.85 A / 22.6%.**

La etiqueta de esta unidad aporta además tolerancias específicas que deben conservarse como datos del panel fotografiado: **±3% para Pmax, ±3% para Voc y ±4% para Isc**, así como **80% ±5% de bifacialidad**.

La principal precaución es que RUNERGY ha publicado varias revisiones del HY-DH144N8. Por eso, datos como **peso, grosor del marco, configuración exacta de conectores y longitud de cable** no deben copiarse de una revisión diferente y atribuirse automáticamente a esta unidad.

