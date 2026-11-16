# Santa Secreto — Familia Cristancho Moreno
## Guía de instalación, configuración y uso (Windows, Neon, GitHub y Vercel)

Este proyecto es una aplicación **Next.js + PostgreSQL (Neon)** con acceso individual mediante usuario/contraseña, lista de deseos privada, panel organizador por totales y sorteo único y secreto.

**No hace falta instalar PostgreSQL ni pgAdmin en tu computador.** Neon aloja PostgreSQL en internet y proporciona un editor SQL desde el navegador. MySQL puede quedar instalado: no lo utilizaremos para esta aplicación.

## 1. Preparar las herramientas

1. Instala **Node.js LTS** desde https://nodejs.org/en/download/ . Incluye npm.
2. Instala **Visual Studio Code** desde https://code.visualstudio.com/ .
3. Crea una cuenta en **Neon**: https://console.neon.tech/ .
4. Ten listas tus cuentas de **GitHub** (https://github.com/) y **Vercel** (https://vercel.com/).
5. **Opcional:** instala Git desde https://git-scm.com/download/win si quieres subir archivos desde la terminal de VS Code. También puedes subirlos desde la web de GitHub.

Abre la terminal de VS Code (**Terminal > Nueva terminal**) y verifica:

```powershell
node -v
npm -v
```

Si aparecen versiones, ya tienes las herramientas necesarias. Si PowerShell bloquea `npm.ps1`, usa **Command Prompt / Símbolo del sistema** como terminal dentro de VS Code en lugar de cambiar la política de seguridad del sistema.

## 2. Crear la base de datos PostgreSQL en Neon

1. Entra a https://console.neon.tech/ y haz clic en **New project / Create project**.
2. Escribe un nombre, por ejemplo **santa-secreto-cristancho-moreno**. Selecciona una región disponible y el plan que quieras utilizar (revisa condiciones y límites de uso actuales).
3. Dentro del proyecto, abre **SQL Editor**.
4. En VS Code, abre `db/schema.sql`, selecciona todo (Ctrl+A), copia y pega en SQL Editor.
5. Haz clic en **Run**. Esto crea `app_settings`, `participants`, `assignments`, `login_attempts` y las funciones `enroll_participant`, `set_expected_participants`, `perform_secret_draw`.
6. En Neon, haz clic en **Connect** y copia la cadena PostgreSQL con **Connection pooling** activado. El host debe contener `-pooler`. La cadena empieza por `postgresql://`.

**Muy importante:** la cadena de conexión incluye tu contraseña de Neon. No la compartas por chat ni la subas a GitHub.

## 3. Abrir el proyecto en VS Code

1. Descomprime `santa-secreto-cristancho-moreno.zip` en una carpeta de tu PC.
2. En Visual Studio Code: **Archivo > Abrir carpeta**, y elige `santa-secreto-cristancho-moreno` (la carpeta donde aparece `package.json`).
3. Abre **Terminal > Nueva terminal** dentro de la carpeta y ejecuta:

```powershell
npm install
```

Esto instalará Next.js, React, bcryptjs, jose y el controlador de PostgreSQL. Necesitas conexión a internet para descargar dependencias.

## 4. Configurar las claves de forma privada

1. Haz una copia de `.env.example` y nómbrala **`.env.local`**.
2. Abre `.env.local` y sustituye los textos de ejemplo por tus datos:

```dotenv
DATABASE_URL=postgresql://...tu-cadena-real-de-neon...
APP_SECRET=una_clave_generada_aleatoriamente_con_64_caracteres_hex
ADMIN_USERNAME=organizador
ADMIN_PASSWORD=tu_contrasena_larga_y_unica_de_administrador
INVITE_CODE=un_codigo_secreto_que_compartiras_solo_con_la_familia
```

3. Genera una clave aleatoria para `APP_SECRET` ejecutando en la terminal:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado y pégalo como valor de `APP_SECRET` (sin comillas).

4. Elige una contraseña de administrador **distinta** del código familiar. La contraseña del administrador debe tener como mínimo 12 caracteres; recomiendo 16 o más. El código familiar debe tener por lo menos 8 caracteres.
5. Guarda `.env.local`. Está ignorado por Git. **No lo copies dentro del repositorio.**

Importante: cada persona tendrá su propia contraseña. `ADMIN_PASSWORD` es solamente para entrar al panel organizador. Si cambias las variables en `.env.local`, reinicia `npm run dev`.

## 5. Comprobar la conexión y probar la página en tu computador

Antes de iniciar, verifica la base con:

```powershell
npm run db:check
```

La terminal debe mostrar `Conexión PostgreSQL correcta`. Solo imprime cantidades y nunca revela nombres ni deseos. Si falla, revisa la cadena y que ejecutaste el SQL del paso 2.

En la terminal de VS Code ejecuta:

```powershell
npm run dev
```

Abre en tu navegador: **http://localhost:3000**

1. Inicia sesión con `ADMIN_USERNAME` y `ADMIN_PASSWORD` definidos en `.env.local`.
2. En el **Panel organizador**, establece el total de participantes, por ejemplo `6`, y guarda.
3. Cierra la sesión.
4. En la pantalla principal selecciona **Inscribirme**.
5. Cada persona escribe **su nombre, su usuario, su contraseña, sus gustos y el código familiar**. Es un registro por persona, aunque pertenezcan a la misma casa.
6. Al registrarse, el participante entra en su espacio privado. Ahí podrá modificar sus deseos antes del sorteo.
7. Repite el registro para las otras personas (cierra la sesión o utiliza ventanas privadas diferentes).
8. La organizadora vuelve a ingresar. Solo verá cuántos inscritos hay y cuántos asignados hay, **no sus nombres ni sus deseos**.
9. Cuando el número de inscritos iguale al cupo configurado, selecciona **Realizar sorteo definitivo** y confirma.
10. Cada persona vuelve a iniciar sesión. Aparecerán **únicamente el nombre y los gustos de su destinatario**.

**Precaución:** el sorteo es irreversible desde la aplicación. No lo pulses durante pruebas con personas ficticias en la base que después usarás en Navidad. Para ensayar, utiliza una base de datos Neon separada.

## 6. Subir a GitHub

1. Abre GitHub y haz clic en **New repository**.
2. Nombre sugerido: `santa-secreto-cristancho-moreno`.
3. Puedes crear el repositorio **Private** para proteger el código (esto no sustituye el acceso por contraseña de la web).
4. No inicialices el repositorio con README si lo vas a subir desde esta carpeta.
5. En la terminal de VS Code ejecuta (cambia el usuario por el tuyo):

```powershell
git init
git add .
git commit -m "Primera version Santa Secreto"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/santa-secreto-cristancho-moreno.git
git push -u origin main
```

Si Git te solicita el nombre y correo del autor, configura `git config --global user.name "Tu Nombre"` y `git config --global user.email "tu-correo"`. GitHub te pedirá autenticarte en el navegador o con credenciales habilitadas; no uses la contraseña normal como token de terminal.

Comprueba que **NO** aparezcan `.env.local` ni `node_modules` en GitHub. Si accidentalmente subes secretos, cámbialos de inmediato.

## 7. Publicar en Vercel

1. Ingresa a https://vercel.com/ y conéctate con GitHub.
2. Selecciona **Add New > Project** y luego el repositorio `santa-secreto-cristancho-moreno`.
3. Detectará automáticamente **Next.js**. Mantén la configuración habitual.
4. Antes de publicar, en **Environment Variables**, crea estas variables para el entorno **Production** usando exactamente los mismos valores de `.env.local`:
   - `DATABASE_URL`: la cadena privada de Neon con `-pooler`.
   - `APP_SECRET`: la clave aleatoria generada.
   - `ADMIN_USERNAME`: el usuario del panel organizador.
   - `ADMIN_PASSWORD`: la contraseña del panel organizador.
   - `INVITE_CODE`: el código privado de la familia.
5. Haz clic en **Deploy**. Una vez finalizado, Vercel te entregará un enlace `https://...vercel.app`.
6. Ingresa con el usuario organizador para comprobar que la base de datos responde. Comparte el enlace con la familia por WhatsApp, junto con **solo el código de invitación**; cada participante debe elegir su propio usuario y contraseña.

En Vercel, para modificar las variables después, entra al proyecto > **Settings > Environment Variables** y luego vuelve a desplegar. Si los datos se introducen únicamente en tu computador, la web publicada no los podrá leer: hay que configurarlos en Vercel también.

## 8. Qué puede ver cada persona

| Persona | Antes del sorteo | Después del sorteo |
|---|---|---|
| Participante | Su propia lista de gustos, que puede editar | Nombre y deseos de su destinatario, únicamente |
| Organizadora | Cantidad de inscritos y cupo total | Cantidad de inscritos/asignados y estado final |
| Visitante sin cuenta | Formulario de acceso e inscripción con código | No puede consultar datos personales |

Cada participante recibe exactamente una persona distinta; nadie se saca a sí mismo, y nadie puede recibir a dos participantes. El sorteo genera **un ciclo aleatorio** entre los inscritos: esto garantiza las asignaciones válidas. Se realiza dentro de una función transaccional en PostgreSQL.

**Límite de privacidad importante:** la aplicación y el panel de administración no muestran nombres de destinatarios ni sus deseos, pero quien tenga acceso administrativo directo a Neon y su base de datos técnicamente podrá consultar sus tablas. La privacidad absoluta frente al propietario de la base requeriría un diseño adicional con cifrado de extremo a extremo y administración separada.

## 9. Problemas frecuentes

- **Error `Falta la variable DATABASE_URL`:** revisa que el archivo se llame exactamente `.env.local` y esté junto a `package.json`; reinicia el servidor.
- **`relation "participants" does not exist`:** no se ejecutó `db/schema.sql` en el proyecto y base de datos correspondientes de Neon.
- **Acceso denegado o error de conexión:** revisa la cadena PostgreSQL y sus credenciales en Neon, y evita incluir comillas innecesarias en la variable.
- **No permite inscribir más personas:** se alcanzó el cupo o el sorteo ya está cerrado. Antes del sorteo, la organizadora puede aumentar el total previsto.
- **No puedo realizar el sorteo:** debes definir el total y esperar a que se inscriba exactamente esa cantidad.
- **Olvidé la contraseña de participante:** esta primera versión no incluye recuperación automática porque no almacena correos ni teléfonos. Debe añadirse posteriormente un mecanismo de recuperación seguro; no compartas contraseñas por WhatsApp.
- **Vercel muestra error y local funciona:** comprueba las cinco variables en Vercel, que el esquema fue creado en la misma base y que has vuelto a desplegar después de actualizar las variables.
- **GitHub tiene un código distinto del que ves en Vercel:** revisa que Vercel esté vinculado a la rama `main`.

## 10. Seguridad y alcance de esta primera versión

- Passwords de familiares almacenadas como **hash bcrypt**; nunca se guardan en texto plano en la tabla.
- Sesión con cookie **HTTP-only**, firma y caducidad; roles comprobados en el servidor.
- Código de invitación familiar; límites básicos de intentos fallidos de acceso por nombre de usuario.
- Rutas del administrador separadas de rutas de participantes; el administrador solo consulta estadísticas agregadas.
- Sorteo realizado una sola vez dentro de PostgreSQL con bloqueo para evitar ejecuciones simultáneas.
- La app no cuenta con email, WhatsApp automático, recuperación de cuenta, edición de nombre, exclusiones entre parejas ni mecanismo para eliminar participantes después de registrarse. Son funciones que podrían añadirse.
- Para una publicación abierta y de larga duración sería recomendable reforzar más el control de bots, auditar la configuración de la base y definir un proceso de recuperación de acceso.

**No envíes aquí la contraseña de Neon, de Vercel, del administrador ni de ningún participante.** Puedes mostrar capturas de pantalla ocultando las credenciales para recibir ayuda.
