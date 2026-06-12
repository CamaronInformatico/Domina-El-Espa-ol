// Variables globales del estado de la aplicación
let currentUser = localStorage.getItem('currentUser') || "";
let currentRole = localStorage.getItem('currentRole') || "";
let currentEmail = localStorage.getItem('currentEmail') || "";
let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
let clases = JSON.parse(localStorage.getItem('clases')) || [];
const legacyUserClases = JSON.parse(localStorage.getItem('userClases')) || null;
if (legacyUserClases && Array.isArray(Object.values(legacyUserClases))) {
    Object.values(legacyUserClases).forEach(docenteClases => {
        if (Array.isArray(docenteClases)) {
            docenteClases.forEach(clase => {
                clases.push({
                    id: clase.id || Date.now(),
                    code: clase.code || generarCodigoClase(),
                    titulo: clase.titulo || '',
                    contenido: clase.contenido || '',
                    fecha: clase.fecha || new Date().toLocaleDateString('es-ES'),
                    estado: clase.estado || 'publicada',
                    profesor: clase.profesor || currentEmail,
                    students: clase.students || [],
                    archivo: clase.archivo || '',
                    createdAt: clase.createdAt || new Date().toISOString()
                });
            });
        }
    });
    localStorage.removeItem('userClases');
    localStorage.setItem('clases', JSON.stringify(clases));
}
let materiales = JSON.parse(localStorage.getItem('materiales'));
if (!materiales || !Array.isArray(materiales) || materiales.length === 0) {
    materiales = [
        {
            id: 1,
            title: "Lenguajes Primero de secundaria",
            type: "libro",
            link: "https://libros.conaliteg.gob.mx/2023/S1LEA.htm",
            imageUrl: "lengua.jpg",
            source: "https://libros.conaliteg.gob.mx/2023/S1LEA.htm",
            fileName: "",
            fileData: null,
            date: new Date().toLocaleDateString('es-ES'),
            teacher: "sistema@plataforma.com"
        },
        {
            id: 2,
            title: "Lenguajes Segundo de secundaria",
            type: "libro",
            link: "https://libros.conaliteg.gob.mx/2024/S2LEA.htm",
            imageUrl: "lenguajes2.jpg",
            source: "https://libros.conaliteg.gob.mx/2024/S2LEA.htm",
            fileName: "",
            fileData: null,
            date: new Date().toLocaleDateString('es-ES'),
            teacher: "sistema@plataforma.com"
        },
        {
            id: 4,
            title: "Enseñar Lengua",
            type: "material",
            imageUrl: "enseñar-lengua-cover.jpg",
            source: "enseñar-lengua.pdf",
            fileName: "",
            fileData: null,
            date: new Date().toLocaleDateString('es-ES'),
            teacher: "sistema@plataforma.com"
        }
    ];
    localStorage.setItem('materiales', JSON.stringify(materiales));
}
let submissions = JSON.parse(localStorage.getItem('submissions')) || [];

/**
 * Alterna a la vista de registro
 */
function switchToRegister(event) {
    event.preventDefault();
    document.getElementById('login-step').style.display = 'none';
    document.getElementById('register-step').style.display = 'block';
}

/**
 * Alterna a la vista de login
 */
function switchToLogin(event) {
    event.preventDefault();
    document.getElementById('register-step').style.display = 'none';
    document.getElementById('login-step').style.display = 'block';
}

/**
 * Maneja el registro de un nuevo usuario
 */
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden. Por favor, intenta de nuevo.');
        return;
    }
    
    // Validar que la contraseña tenga mínimo 6 caracteres
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    
    // Verificar si el correo ya está registrado
    if (registeredUsers.some(user => user.email === email)) {
        alert('Este correo ya está registrado. Por favor, usa otro o inicia sesión.');
        return;
    }
    
    // Guardar el nuevo usuario con matrícula inicial
    const newUser = { name, email, password, matricula: generarMatricula(), role: '', joinedClasses: [] };
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    currentUser = name;
    currentEmail = email;
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('currentEmail', currentEmail);
    
    // Limpiar formularios
    document.getElementById('register-name').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-confirm-password').value = '';
    
    alert('¡Cuenta creada exitosamente! Ahora selecciona tu rol.');
    
    // Mostrar selección de rol
    document.getElementById('register-step').style.display = 'none';
    document.getElementById('role-step').style.display = 'block';
}

/**
 * Maneja el login de un usuario existente
 */
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Buscar el usuario en los registrados
    const user = registeredUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
        // Si el correo existe pero la contraseña es incorrecta
        const userExists = registeredUsers.some(u => u.email === email);
        if (userExists) {
            alert('Contraseña incorrecta. Por favor, intenta de nuevo.');
        } else {
            alert('Este correo no está registrado. ¿Deseas crear una nueva cuenta?');
            switchToRegister({preventDefault: () => {}});
            // Prellenar el correo en el formulario de registro
            document.getElementById('register-email').value = email;
        }
        return;
    }
    
    currentUser = user.name;
    currentEmail = email;
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('currentEmail', currentEmail);
    
    if (!user.matricula) {
        user.matricula = generarMatricula();
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }
    
    // Limpiar formulario
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    
    // Mostrar selección de rol
    document.getElementById('login-step').style.display = 'none';
    document.getElementById('role-step').style.display = 'block';
}

/**
 * Define el rol de acceso (estudiante/docente) y activa el dashboard.
 * @param {string} role - El rol escogido.
 */
function setRole(role) {
    currentRole = role;
    localStorage.setItem('currentRole', currentRole);
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('currentEmail', currentEmail);
    
    // Guardar rol del usuario en la base de datos de registrados
    const user = registeredUsers.find(u => u.email === currentEmail);
    if (user) {
        user.role = role;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }
    
    // Cerrar módulo de Login por completo e inicializar interfaz principal
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('main-page').style.display = 'flex';
    
    // Actualizar nombre del usuario obtenido por login en la UI
    document.getElementById('user-display-name').innerHTML = `<i class="fa-solid fa-user-circle"></i> ${currentUser}`;
    document.getElementById('input-username').value = currentUser;

    // Renderizado condicional de componentes dependiendo del rol asignado
    const studentElements = document.querySelectorAll('.student-view');
    const teacherElements = document.querySelectorAll('.teacher-view');

    if (role === 'estudiante') {
        studentElements.forEach(el => el.style.display = 'block');
        teacherElements.forEach(el => el.style.display = 'none');
        mostrarMatricula();
        cargarClasesEstudiante();
        cargarPendientesEstudiante();
        cargarTareasEntregadas();
        cargarMateriales();
    } else {
        studentElements.forEach(el => el.style.display = 'none');
        teacherElements.forEach(el => el.style.display = 'block');
        cargarClasesDocente();
        cargarGradingItems();
        cargarMateriales();
    }
}

/**
 * Cierra la sesión del usuario
 */
function logoutUser() {
    currentUser = '';
    currentEmail = '';
    currentRole = '';
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('currentEmail');
    
    // Cerrar modal de perfil si está abierto
    closeModal('modal-perfil');
    
    // Mostrar login nuevamente
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
    
    // Mostrar paso de login
    document.getElementById('login-step').style.display = 'block';
    document.getElementById('register-step').style.display = 'none';
    document.getElementById('role-step').style.display = 'none';
    
    alert('Has cerrado sesión. ¡Hasta pronto!');
}

/**
 * Abre una ventana modal por ID
 */
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

/**
 * Cierra una ventana modal por ID
 */
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

/**
 * Guarda los cambios realizados en el formulario de edición de perfil
 */
function saveProfile() {
    const newName = document.getElementById('input-username').value;
    if(newName.trim() !== "") {
        currentUser = newName;
        localStorage.setItem('currentUser', currentUser);
        document.getElementById('user-display-name').innerHTML = `<i class="fa-solid fa-user-circle"></i> ${currentUser}`;
        
        // Sincronizar en la base de datos de usuarios registrados
        const user = registeredUsers.find(u => u.email === currentEmail);
        if (user) {
            user.name = newName;
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }
    }
    alert('Perfil actualizado con éxito');
    closeModal('modal-perfil');
}

/**
 * Guarda una clase creada por el docente
 */
function guardarClase(estado) {
    const titulo = document.getElementById('clase-titulo').value.trim();
    const contenido = document.getElementById('clase-contenido').value.trim();
    
    // Validar que al menos tenga título y contenido
    if (!titulo) {
        alert('Por favor, ingresa un título para la clase.');
        return;
    }
    
    if (!contenido) {
        alert('Por favor, ingresa el contenido de la clase.');
        return;
    }

    const archivoInput = document.getElementById('clase-archivo');
    const archivo = archivoInput.files.length ? archivoInput.files[0].name : '';
    
    // Si se está editando una clase existente
    if (window.claseEnEdicion) {
        const clase = clases.find(c => c.id === window.claseEnEdicion);
        if (clase) {
            clase.titulo = titulo;
            clase.contenido = contenido;
            clase.archivo = archivo || clase.archivo;
            clase.estado = estado;
            clase.fecha = new Date().toLocaleDateString('es-ES');
            localStorage.setItem('clases', JSON.stringify(clases));
            alert('Clase actualizada correctamente.');
            window.claseEnEdicion = null;
        }
    } else {
        const clase = {
            id: Date.now(),
            code: generarCodigoClase(),
            titulo: titulo,
            contenido: contenido,
            fecha: new Date().toLocaleDateString('es-ES'),
            estado: estado,
            profesor: currentEmail,
            students: [],
            archivo: archivo,
            createdAt: new Date().toISOString()
        };
        clases.push(clase);
        localStorage.setItem('clases', JSON.stringify(clases));
    }
    
    // Limpiar formulario
    document.getElementById('clase-titulo').value = '';
    document.getElementById('clase-contenido').value = '';
    document.getElementById('clase-archivo').value = '';
    
    // Mostrar mensaje de éxito
    const estadoTexto = estado === 'publicada' ? '¡Clase publicada exitosamente!' : '¡Clase guardada en borradores!';
    alert(estadoTexto);
    
    // Cerrar modal
    closeModal('modal-crear-clase');
    
    cargarClasesDocente();
}

/**
 * Carga y muestra las clases del docente actual
 */
function cargarClasesDocente() {
    const listaClases = document.getElementById('lista-clases');
    const countClases = document.getElementById('clase-count');
    const selectAvances = document.getElementById('avances-clase-select');
    
    if (!listaClases) return;
    
    const misClases = clases.filter(c => c.profesor === currentEmail);
    countClases.textContent = misClases.length;
    
    listaClases.innerHTML = '';
    
    // Poblar dropdown de avances
    if (selectAvances) {
        const currentSel = selectAvances.value;
        selectAvances.innerHTML = '<option value="">-- Seleccionar clase --</option>';
        misClases.forEach(clase => {
            const opt = document.createElement('option');
            opt.value = clase.code;
            opt.textContent = `${clase.titulo} (${clase.code})`;
            selectAvances.appendChild(opt);
        });
        if (misClases.some(c => c.code === currentSel)) {
            selectAvances.value = currentSel;
        }
    }
    
    if (misClases.length === 0) {
        listaClases.innerHTML = '<p style="color: #999; text-align: center; margin: 20px 0;">No hay clases creadas aún</p>';
        if (selectAvances) {
            document.getElementById('avances-alumnos-container').innerHTML = '<p style="color: #999; text-align: center; margin: 10px 0;">No tienes clases creadas actualmente.</p>';
        }
        return;
    }
    
    misClases.forEach((clase) => {
        const estadoBadge = clase.estado === 'publicada' 
            ? '<span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px;">Publicada</span>'
            : '<span style="background: #FF9800; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px;">Borrador</span>';

        const numActs = clase.actividades ? clase.actividades.length : 0;
        const numStuds = clase.students ? clase.students.length : 0;

        const claseHTML = `
            <div style="background: #f5f5f5; border-left: 4px solid var(--primary-purple); padding: 12px; margin: 10px 0; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                    <div style="flex: 1; text-align: left;">
                        <strong style="font-size: 15px; color: var(--primary-purple);">${clase.titulo}</strong>
                        <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">Código: <strong>${clase.code}</strong></p>
                        <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">Creada: ${clase.fecha}</p>
                    </div>
                    <div>${estadoBadge}</div>
                </div>
                <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end;">
                    <button class="role-btn" style="padding: 6px 10px; font-size: 11px; background: #9C27B0; color: white;" onclick="abrirModalActividadesClase('${clase.code}')"><i class="fa-solid fa-tasks"></i> Actividades (${numActs})</button>
                    <button class="role-btn" style="padding: 6px 10px; font-size: 11px; background: #2196F3; color: white;" onclick="abrirModalAlumnosClase('${clase.code}')"><i class="fa-solid fa-users"></i> Alumnos (${numStuds})</button>
                    <button class="role-btn" style="padding: 6px 10px; font-size: 11px; background: #777; color: white;" onclick="editarClase(${clase.id})">Editar</button>
                    <button class="role-btn" style="padding: 6px 10px; font-size: 11px; background: #f44336; color: white;" onclick="eliminarClase(${clase.id})">Eliminar</button>
                </div>
            </div>
        `;
        
        listaClases.innerHTML += claseHTML;
    });
    
    actualizarAvancesAlumnos();
}

function cargarClasesEstudiante() {
    const listaClases = document.getElementById('student-class-list');
    if (!listaClases) return;
    
    const misClases = clases.filter(c => c.students && c.students.includes(currentEmail));
    listaClases.innerHTML = '';
    
    if (misClases.length === 0) {
        listaClases.innerHTML = '<p style="color: #999; text-align: center; margin: 20px 0;">No estás inscrito en ninguna clase.</p>';
        return;
    }
    
    misClases.forEach(clase => {
        // Generar lista de actividades
        let actividadesHTML = '';
        if (clase.actividades && clase.actividades.length > 0) {
            actividadesHTML = '<div style="margin-top: 10px; border-top: 1px solid #ddd; padding-top: 8px;"><strong>Actividades de la clase:</strong>';
            clase.actividades.forEach(act => {
                const sub = submissions.find(s => s.classCode === clase.code && s.activityId === act.id && s.studentEmail === currentEmail);
                let statusBadge = '<span style="color: #f44336; font-weight: bold;">[Pendiente]</span>';
                let actionBtn = `<button class="role-btn" style="padding: 3px 8px; font-size: 11px; margin-left: 10px; background: var(--primary-purple); color: white;" onclick="abrirModalEntregaActividad('${clase.code}', ${act.id})">Entregar</button>`;
                
                if (sub) {
                    if (sub.status === 'calificado') {
                        statusBadge = `<span style="color: #4CAF50; font-weight: bold;">[Calificado: ${'⭐'.repeat(parseInt(sub.grade || 5))}]</span>`;
                        actionBtn = `<span style="color: #666; font-size: 11px; margin-left: 10px;">Entregado</span>`;
                    } else {
                        statusBadge = '<span style="color: #FF9800; font-weight: bold;">[Entregado - Pendiente]</span>';
                        actionBtn = `<span style="color: #666; font-size: 11px; margin-left: 10px;">Enviado</span>`;
                    }
                }
                
                actividadesHTML += `
                    <div style="font-size: 12px; display: flex; justify-content: space-between; align-items: center; margin: 5px 0;">
                        <span>- <strong>${act.titulo}</strong> (Límite: ${act.fechaLimite || 'Sin fecha'}) ${statusBadge}</span>
                        ${actionBtn}
                    </div>
                `;
            });
            actividadesHTML += '</div>';
        } else {
            actividadesHTML = '<p style="font-size: 12px; color: #777; margin-top: 8px;">No hay actividades asignadas en esta clase.</p>';
        }

        const claseHTML = `
            <div style="background: #f5f5f5; border-left: 4px solid var(--primary-purple); padding: 12px; margin: 10px 0; border-radius: 4px; text-align: left;">
                <strong style="font-size: 15px; color: var(--primary-purple);">${clase.titulo}</strong>
                <p style="font-size: 11px; color: #666; margin: 3px 0 8px 0;">Código: <strong>${clase.code}</strong></p>
                <p style="font-size: 13px; color: #333; line-height: 1.4; background: #fff; padding: 8px; border-radius: 4px; border: 1px solid #eee;">${clase.contenido}</p>
                ${actividadesHTML}
            </div>
        `;
        listaClases.innerHTML += claseHTML;
    });
}

/**
 * Genera un código de clase único
 */
function generarCodigoClase() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
    code += '-';
    for (let i = 0; i < 4; i++) code += digits.charAt(Math.floor(Math.random() * digits.length));
    if (clases.some(c => c.code === code)) return generarCodigoClase();
    return code;
}

/**
 * Genera una matrícula para el alumno
 */
function generarMatricula() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    let m = 'A';
    for (let i = 0; i < 7; i++) {
        m += (Math.random() > 0.5 ? letters.charAt(Math.floor(Math.random() * letters.length)) : digits.charAt(Math.floor(Math.random() * digits.length)));
    }
    return m;
}

/**
 * Muestra la matrícula del alumno en la UI
 */
function mostrarMatricula() {
    const user = registeredUsers.find(u => u.email === currentEmail);
    if (!user) return;
    if (!user.matricula) {
        user.matricula = generarMatricula();
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }
    document.getElementById('mi-matricula').textContent = user.matricula;
    const profileMat = document.getElementById('profile-matricula');
    if (profileMat) profileMat.value = user.matricula;
    const studentMatDisplay = document.getElementById('student-matricula-display');
    if (studentMatDisplay) studentMatDisplay.textContent = user.matricula;
}

/**
 * Permite a un estudiante unirse a una clase por código
 */
function unirseClase() {
    const code = document.getElementById('join-class-code').value.trim().toUpperCase();
    const feedback = document.getElementById('join-class-feedback');
    if (!code) {
        feedback.textContent = 'Por favor ingresa un código de clase.';
        return;
    }
    const clase = clases.find(c => c.code === code);
    if (!clase) {
        feedback.textContent = 'Código de clase no válido. Revisa con tu docente.';
        return;
    }
    if (!clase.students.includes(currentEmail)) {
        clase.students.push(currentEmail);
        localStorage.setItem('clases', JSON.stringify(clases));
    }
    feedback.textContent = `Te has unido a la clase ${clase.titulo}.`;
    cargarClasesEstudiante();
}

/**
 * El docente agrega un alumno por matrícula a una clase
 */
function agregarAlumnoPorMatricula(claseCode) {
    const matricula = prompt('Ingresa la matrícula del alumno que quieres agregar:');
    if (!matricula) return;
    const alumno = registeredUsers.find(u => u.matricula === matricula.trim());
    if (!alumno) {
        alert('No existe ningún alumno con esa matrícula.');
        return;
    }
    const clase = clases.find(c => c.code === claseCode);
    if (!clase) {
        alert('Clase no encontrada.');
        return;
    }
    if (!clase.students.includes(alumno.email)) {
        clase.students.push(alumno.email);
        localStorage.setItem('clases', JSON.stringify(clases));
        alert(`${alumno.name} fue agregado a la clase ${clase.titulo}.`);
        cargarClasesDocente();
    } else {
        alert('Este alumno ya está inscrito en la clase.');
    }
}

/**
 * Carga los trabajos pendientes para el docente
 */
function cargarGradingItems() {
    const gradingList = document.getElementById('grading-list');
    if (!gradingList) return;
    const misClases = clases.filter(c => c.profesor === currentEmail);
    const trabajos = submissions.filter(s => misClases.some(c => c.code === s.classCode) && s.status === 'pendiente');
    gradingList.innerHTML = '';
    if (trabajos.length === 0) {
        gradingList.innerHTML = '<p style="color: #999; text-align: center; margin: 20px 0;">No hay trabajos pendientes por calificar.</p>';
        return;
    }
    trabajos.forEach(sub => {
        const tareaHTML = `
            <div style="background: #f5f5f5; border-left: 4px solid var(--primary-purple); padding: 12px; margin: 10px 0; border-radius: 4px;">
                <strong style="font-size: 14px;">${sub.taskTitle}</strong>
                <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">Alumno: ${sub.studentName} | Clase: ${sub.classCode}</p>
                <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="role-btn" style="padding: 6px 12px; font-size: 12px;" onclick="openRatingModal('${sub.id}')">Ver y calificar</button>
                </div>
            </div>
        `;
        gradingList.innerHTML += tareaHTML;
    });
}

/**
 * Abre el modal específico de evaluación para los docentes
 */
function openRatingModal(submissionId) {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) {
        alert('Trabajo no encontrado.');
        return;
    }
    document.getElementById('calificar-info').innerHTML = `Evaluando a: <strong>${submission.studentName}</strong><br>Clase: <strong>${submission.classCode}</strong>`;
    document.getElementById('submission-content').textContent = submission.content;
    
    // Configurar archivo adjunto
    const fileContainer = document.getElementById('submission-file-container');
    const btnOpen = document.getElementById('btn-open-submission-file');
    if (submission.fileData) {
        fileContainer.style.display = 'block';
        btnOpen.onclick = () => {
            try {
                const blob = dataURLtoBlob(submission.fileData);
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            } catch (e) {
                // Fallback direct open/download
                const link = document.createElement('a');
                link.href = submission.fileData;
                link.download = submission.fileName || 'archivo';
                link.click();
            }
        };
    } else {
        fileContainer.style.display = 'none';
    }

    document.getElementById('calificacion-stars').value = '5';
    window.currentSubmissionId = submissionId;
    openModal('modal-calificar');
}

/**
 * Guarda la calificación del docente
 */
function guardarCalificacion() {
    const submission = submissions.find(s => s.id === window.currentSubmissionId);
    if (!submission) {
        alert('No hay trabajo seleccionado.');
        return;
    }
    const grade = document.getElementById('calificacion-stars').value;
    submission.status = 'calificado';
    submission.grade = grade;
    submission.gradedAt = new Date().toLocaleString('es-ES');
    localStorage.setItem('submissions', JSON.stringify(submissions));
    alert('Calificación guardada y enviada al alumno.');
    closeModal('modal-calificar');
    cargarGradingItems();
}

/**
 * Agrega un material o libro a la lista general
 */
function agregarMaterial(type) {
    const tituloInput = document.getElementById(`${type}-titulo`);
    const linkInput = document.getElementById(`${type}-link`);
    const imageUrlInput = document.getElementById(`${type}-imagen-url`);
    const imageFileInput = document.getElementById(`${type}-imagen-file`);
    const archivoInput = document.getElementById(`${type}-archivo`);

    const titulo = tituloInput.value.trim();
    const link = linkInput ? linkInput.value.trim() : '';
    const imageUrl = imageUrlInput ? imageUrlInput.value.trim() : '';
    const imageFile = imageFileInput && imageFileInput.files.length ? imageFileInput.files[0] : null;
    const file = archivoInput.files.length ? archivoInput.files[0] : null;

    if (!titulo) {
        alert('Por favor, ingresa al menos el título del recurso.');
        return;
    }

    const readAsDataURL = (f) => {
        return new Promise((resolve, reject) => {
            if (!f) {
                resolve({ data: null, name: '' });
                return;
            }
            if (f.size > 1.5 * 1024 * 1024) {
                reject(new Error(`El archivo ${f.name} es demasiado grande (máximo 1.5 MB para guardar localmente).`));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => resolve({ data: e.target.result, name: f.name });
            reader.onerror = () => reject(new Error(`Error al leer el archivo ${f.name}.`));
            reader.readAsDataURL(f);
        });
    };

    Promise.all([readAsDataURL(imageFile), readAsDataURL(file)])
        .then(([imgRes, docRes]) => {
            const finalImageUrl = imageUrl || imgRes.data || '';
            const item = {
                id: Date.now(),
                title: titulo,
                link: link,
                imageUrl: finalImageUrl,
                type: type,
                fileName: docRes.name,
                fileData: docRes.data,
                source: link || docRes.name || '',
                teacher: currentEmail,
                date: new Date().toLocaleDateString('es-ES')
            };

            materiales.push(item);
            localStorage.setItem('materiales', JSON.stringify(materiales));

            // Limpiar inputs
            tituloInput.value = '';
            if (linkInput) linkInput.value = '';
            if (imageUrlInput) imageUrlInput.value = '';
            if (imageFileInput) imageFileInput.value = '';
            archivoInput.value = '';

            cargarMateriales();
            alert(`${type === 'libro' ? 'Libro' : 'Material'} agregado con éxito.`);
        })
        .catch(err => {
            alert(err.message);
        });
}

/**
 * Carga los libros y materiales en la UI
 */
function cargarMateriales() {
    const librosList = document.getElementById('libros-list');
    const materialList = document.getElementById('material-list');
    if (!librosList || !materialList) return;
    
    const libros = materiales.filter(m => m.type === 'libro');
    const materialesDidacticos = materiales.filter(m => m.type === 'material');
    
    librosList.innerHTML = '';
    materialList.innerHTML = '';
    
    const renderCard = (item) => {
        const defaultCovers = {
            libro: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop",
            material: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=300&auto=format&fit=crop"
        };
        const cover = item.imageUrl || defaultCovers[item.type];
        const hasActions = currentRole === 'docente';
        
        return `
            <div class="resource-card" onclick="abrirMaterial(${item.id})">
                <img src="${cover}" class="resource-cover" alt="${item.title}" onerror="this.src='${defaultCovers[item.type]}'">
                <div class="resource-info">
                    <div>
                        <div class="resource-title" title="${item.title}">${item.title}</div>
                        <div class="resource-meta">Añadido: ${item.date}</div>
                    </div>
                    <div class="resource-actions" onclick="event.stopPropagation();">
                        <button class="resource-btn resource-btn-open" onclick="abrirMaterial(${item.id})"><i class="fa-solid fa-external-link"></i> Abrir</button>
                        ${hasActions ? `<button class="resource-btn resource-btn-delete" onclick="eliminarMaterial(${item.id})"><i class="fa-solid fa-trash"></i></button>` : ''}
                    </div>
                </div>
            </div>
        `;
    };
    
    if (libros.length === 0) {
        librosList.innerHTML = '<p style="color: #999; text-align: center; margin: 20px 0; width: 100%;">No hay libros cargados aún.</p>';
    } else {
        libros.forEach(item => {
            librosList.innerHTML += renderCard(item);
        });
    }
    if (materialesDidacticos.length === 0) {
        materialList.innerHTML = '<p style="color: #999; text-align: center; margin: 20px 0; width: 100%;">No hay material didáctico cargado aún.</p>';
    } else {
        materialesDidacticos.forEach(item => {
            materialList.innerHTML += renderCard(item);
        });
    }
}

/**
 * Abre un material o muestra su nombre
 */
function abrirMaterial(id) {
    const item = materiales.find(m => m.id === id);
    if (!item) return;
    if (item.fileData) {
        try {
            const blob = dataURLtoBlob(item.fileData);
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
        } catch (e) {
            const link = document.createElement('a');
            link.href = item.fileData;
            link.download = item.fileName || 'archivo';
            link.click();
        }
    } else if (item.link && (item.link.startsWith('http://') || item.link.startsWith('https://'))) {
        window.open(item.link, '_blank');
    } else if (item.source && (item.source.startsWith('http://') || item.source.startsWith('https://'))) {
        window.open(item.source, '_blank');
    } else if (item.source) {
        alert(`Contenido: ${item.source}`);
    } else {
        alert('Este recurso no tiene un archivo o enlace configurado.');
    }
}

/**
 * Envía una actividad del alumno a una clase
 */
function submitActividad(classCode) {
    // Redirige al nuevo flujo usando modal de entregas
    const clase = clases.find(c => c.code === classCode);
    if (clase && clase.actividades && clase.actividades.length > 0) {
        abrirModalEntregaActividad(classCode, clase.actividades[0].id);
    } else {
        alert('No hay actividades asignadas a esta clase para entregar.');
    }
}

// Helper: Convertir DataURL en Blob
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

// Controladores Faltantes: Editar y Eliminar Clase
function editarClase(id) {
    const clase = clases.find(c => c.id === id);
    if (!clase) return;
    
    window.claseEnEdicion = id;
    document.getElementById('clase-titulo').value = clase.titulo;
    document.getElementById('clase-contenido').value = clase.contenido;
    
    openModal('modal-crear-clase');
}

function eliminarClase(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta clase?')) {
        clases = clases.filter(c => c.id !== id);
        localStorage.setItem('clases', JSON.stringify(clases));
        cargarClasesDocente();
    }
}

// Actividades de la Clase (Docente)
function abrirModalActividadesClase(claseCode) {
    window.currentClaseCodeActividades = claseCode;
    const clase = clases.find(c => c.code === claseCode);
    if (!clase) return;

    document.getElementById('actividades-clase-titulo-display').textContent = `${clase.titulo} (${clase.code})`;
    
    // Limpiar inputs del formulario
    document.getElementById('actividad-titulo').value = '';
    document.getElementById('actividad-descripcion').value = '';
    document.getElementById('actividad-fecha-limite').value = '';
    
    cargarActividadesClaseList(claseCode);
    openModal('modal-agregar-actividad');
}

function cargarActividadesClaseList(claseCode) {
    const listDiv = document.getElementById('actividades-clase-list');
    if (!listDiv) return;
    
    const clase = clases.find(c => c.code === claseCode);
    if (!clase) return;
    
    listDiv.innerHTML = '';
    
    if (!clase.actividades || clase.actividades.length === 0) {
        listDiv.innerHTML = '<p style="color: #999; text-align: center; margin: 10px 0;">No hay actividades creadas en esta clase.</p>';
        return;
    }
    
    clase.actividades.forEach(act => {
        const itemHTML = `
            <div class="activity-row">
                <div class="activity-info">
                    <span class="activity-title">${act.titulo}</span>
                    <span class="activity-sub">Límite: ${act.fechaLimite || 'Sin límite'}</span>
                </div>
                <div class="row-actions">
                    <button class="row-btn-danger" onclick="eliminarActividad('${claseCode}', ${act.id})">Eliminar</button>
                </div>
            </div>
        `;
        listDiv.innerHTML += itemHTML;
    });
}

function guardarNuevaActividad() {
    const claseCode = window.currentClaseCodeActividades;
    const titulo = document.getElementById('actividad-titulo').value.trim();
    const descripcion = document.getElementById('actividad-descripcion').value.trim();
    const fechaLimite = document.getElementById('actividad-fecha-limite').value;
    
    if (!titulo || !descripcion) {
        alert('Por favor, completa el título y las instrucciones de la actividad.');
        return;
    }
    
    const clase = clases.find(c => c.code === claseCode);
    if (!clase) return;
    
    if (!clase.actividades) {
        clase.actividades = [];
    }
    
    const nuevaActividad = {
        id: Date.now(),
        titulo: titulo,
        descripcion: descripcion,
        fechaLimite: fechaLimite,
        createdAt: new Date().toISOString()
    };
    
    clase.actividades.push(nuevaActividad);
    localStorage.setItem('clases', JSON.stringify(clases));
    
    alert('Actividad creada exitosamente.');
    
    // Limpiar inputs
    document.getElementById('actividad-titulo').value = '';
    document.getElementById('actividad-descripcion').value = '';
    document.getElementById('actividad-fecha-limite').value = '';
    
    cargarActividadesClaseList(claseCode);
    cargarClasesDocente();
}

function eliminarActividad(claseCode, actividadId) {
    if (!confirm('¿Estás seguro de eliminar esta actividad? Se borrarán entregas vinculadas.')) return;
    const clase = clases.find(c => c.code === claseCode);
    if (!clase) return;
    
    clase.actividades = clase.actividades.filter(act => act.id !== actividadId);
    localStorage.setItem('clases', JSON.stringify(clases));
    
    // Eliminar entregas asociadas a la actividad
    submissions = submissions.filter(s => !(s.classCode === claseCode && s.activityId === actividadId));
    localStorage.setItem('submissions', JSON.stringify(submissions));
    
    cargarActividadesClaseList(claseCode);
    cargarClasesDocente();
}

// Gestión de Roster de Alumnos (Docente)
function abrirModalAlumnosClase(claseCode) {
    window.currentClaseCodeAlumnos = claseCode;
    const clase = clases.find(c => c.code === claseCode);
    if (!clase) return;
    
    document.getElementById('roster-clase-titulo').textContent = clase.titulo;
    document.getElementById('roster-clase-code').textContent = clase.code;
    
    // Poblar selector de alumnos de la plataforma
    const select = document.getElementById('select-alumno-plataforma');
    select.innerHTML = '<option value="">-- Seleccionar estudiante --</option>';
    
    // Filtrar usuarios con rol estudiante (o que no tengan rol docente)
    const studentsList = registeredUsers.filter(u => u.role === 'estudiante' || u.role === '');
    
    studentsList.forEach(student => {
        if (!clase.students || !clase.students.includes(student.email)) {
            const opt = document.createElement('option');
            opt.value = student.email;
            opt.textContent = `${student.name} (${student.matricula || 'Sin Matrícula'})`;
            select.appendChild(opt);
        }
    });
    
    cargarAlumnosClaseList(claseCode);
    openModal('modal-alumnos-clase');
}

function cargarAlumnosClaseList(claseCode) {
    const listDiv = document.getElementById('roster-alumnos-list');
    if (!listDiv) return;
    
    const clase = clases.find(c => c.code === claseCode);
    if (!clase) return;
    
    listDiv.innerHTML = '';
    
    if (!clase.students || clase.students.length === 0) {
        listDiv.innerHTML = '<p style="color: #999; text-align: center; margin: 10px 0;">No hay alumnos inscritos en esta clase.</p>';
        return;
    }
    
    clase.students.forEach(studentEmail => {
        const student = registeredUsers.find(u => u.email === studentEmail);
        const name = student ? student.name : studentEmail;
        const mat = student ? (student.matricula || '-') : '-';
        
        const itemHTML = `
            <div class="student-row">
                <div class="student-info">
                    <span class="student-name">${name}</span>
                    <span class="student-sub">Matrícula: ${mat} | Correo: ${studentEmail}</span>
                </div>
                <div class="row-actions">
                    <button class="row-btn-danger" onclick="eliminarAlumnoDeClase('${claseCode}', '${studentEmail}')">Dar Baja</button>
                </div>
            </div>
        `;
        listDiv.innerHTML += itemHTML;
    });
}

function agregarAlumnoDesdeSelect() {
    const select = document.getElementById('select-alumno-plataforma');
    const studentEmail = select.value;
    const claseCode = window.currentClaseCodeAlumnos;
    
    if (!studentEmail) {
        alert('Por favor selecciona un alumno de la lista.');
        return;
    }
    
    const clase = clases.find(c => c.code === claseCode);
    if (!clase) return;
    
    if (!clase.students) {
        clase.students = [];
    }
    
    if (!clase.students.includes(studentEmail)) {
        clase.students.push(studentEmail);
        localStorage.setItem('clases', JSON.stringify(clases));
        alert('Alumno agregado con éxito.');
        abrirModalAlumnosClase(claseCode);
        cargarClasesDocente();
    } else {
        alert('Este alumno ya está inscrito.');
    }
}

/**
 * Carga las tareas entregadas del estudiante actual
 */
function cargarTareasEntregadas() {
    const container = document.getElementById('mis-tareas-entregadas');
    if (!container) return;
    
    const misClases = clases.filter(c => c.students && c.students.includes(currentEmail));
    const tareasEntregadas = submissions.filter(s => s.studentEmail === currentEmail);
    
    container.innerHTML = '';
    
    if (tareasEntregadas.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; margin: 20px 0;">No tienes tareas entregadas aún.</p>';
        return;
    }
    
    tareasEntregadas.forEach(tarea => {
        const clase = misClases.find(c => c.code === tarea.classCode);
        const nombreClase = clase ? clase.titulo : tarea.classCode;
        
        let statusBadge = '';
        let statusColor = '#FF9800';
        
        if (tarea.status === 'calificado') {
            statusBadge = `<span style="color: #4CAF50; font-weight: bold;">[Calificado: ${'⭐'.repeat(parseInt(tarea.grade || 5))}]</span>`;
            statusColor = '#4CAF50';
        } else {
            statusBadge = '<span style="color: #FF9800; font-weight: bold;">[Pendiente]</span>';
        }
        
        const tareaHTML = `
            <div style="background: #f5f5f5; border-left: 4px solid ${statusColor}; padding: 10px; margin: 10px 0; border-radius: 4px; text-align: left;">
                <strong style="font-size: 14px;">${tarea.taskTitle}</strong>
                <p style="font-size: 12px; color: #666; margin: 3px 0 0 0;">Clase: <strong>${nombreClase}</strong></p>
                <p style="font-size: 12px; color: #666; margin: 2px 0 0 0;">Entregado: ${tarea.date}</p>
                <p style="font-size: 12px; color: #555; margin: 5px 0 0 0;">${tarea.content.substring(0, 100)}${tarea.content.length > 100 ? '...' : ''}</p>
                <p style="font-size: 12px; margin: 5px 0 0 0;">${statusBadge}</p>
            </div>
        `;
        
        container.innerHTML += tareaHTML;
    });
}

function eliminarAlumnoDeClase(claseCode, studentEmail) {
    if (!confirm('¿Estás seguro de dar de baja a este alumno?')) return;
    const clase = clases.find(c => c.code === claseCode);
    if (!clase) return;
    
    clase.students = clase.students.filter(email => email !== studentEmail);
    localStorage.setItem('clases', JSON.stringify(clases));
    
    abrirModalAlumnosClase(claseCode);
    cargarClasesDocente();
}

// Pendientes del Alumno (Estudiante)
function cargarPendientesEstudiante() {
    const listaPendientes = document.getElementById('lista-pendientes');
    if (!listaPendientes) return;
    
    const misClases = clases.filter(c => c.students && c.students.includes(currentEmail));
    
    listaPendientes.innerHTML = '';
    let pendientesCount = 0;
    
    misClases.forEach(clase => {
        if (clase.actividades && clase.actividades.length > 0) {
            clase.actividades.forEach(act => {
                // Verificar si este alumno ya hizo entrega
                const sub = submissions.find(s => s.classCode === clase.code && s.activityId === act.id && s.studentEmail === currentEmail);
                if (!sub) {
                    pendientesCount++;
                    const itemHTML = `
                        <div class="pending-task-box" style="margin-bottom: 10px;" onclick="abrirModalEntregaActividad('${clase.code}', ${act.id})">
                            <strong>${act.titulo}</strong> - Clase: ${clase.titulo} <br>
                            <span style="font-size: 12px; color: #555;">Fecha límite: ${act.fechaLimite || 'Sin límite'} (Haz clic para entregar)</span>
                        </div>
                    `;
                    listaPendientes.innerHTML += itemHTML;
                }
            });
        }
    });
    
    if (pendientesCount === 0) {
        listaPendientes.innerHTML = '<p style="color: #999; text-align: center; margin: 20px 0;">No tienes tareas pendientes. ¡Buen trabajo!</p>';
    }
}

function abrirModalEntregaActividad(claseCode, actividadId) {
    const clase = clases.find(c => c.code === claseCode);
    if (!clase) return;
    
    const act = clase.actividades.find(a => a.id === actividadId);
    if (!act) return;
    
    window.currentEntregaClaseCode = claseCode;
    window.currentEntregaActividadId = actividadId;
    window.currentEntregaActividadTitulo = act.titulo;
    
    document.getElementById('entrega-clase-titulo').textContent = clase.titulo;
    document.getElementById('entrega-actividad-titulo').textContent = act.titulo;
    document.getElementById('entrega-actividad-desc').textContent = act.descripcion;
    
    // Limpiar formulario de entrega
    document.getElementById('entrega-contenido').value = '';
    document.getElementById('entrega-archivo').value = '';
    
    openModal('modal-entregar-actividad');
}

function guardarEntregaActividad() {
    const claseCode = window.currentEntregaClaseCode;
    const actId = window.currentEntregaActividadId;
    const actTitulo = window.currentEntregaActividadTitulo;
    
    const content = document.getElementById('entrega-contenido').value.trim();
    const fileInput = document.getElementById('entrega-archivo');
    const file = fileInput.files.length ? fileInput.files[0] : null;
    
    if (!content && !file) {
        alert('Por favor redacta un contenido o adjunta un archivo para tu entrega.');
        return;
    }
    
    const saveSubmission = (fileData = null, fileName = '') => {
        const submission = {
            id: Date.now().toString(),
            studentEmail: currentEmail,
            studentName: currentUser,
            classCode: claseCode,
            activityId: actId,
            taskTitle: actTitulo,
            content: content || `Archivo adjuntado: ${fileName}`,
            fileData: fileData,
            fileName: fileName,
            date: new Date().toLocaleDateString('es-ES'),
            status: 'pendiente'
        };
        
        submissions.push(submission);
        localStorage.setItem('submissions', JSON.stringify(submissions));
        
        alert('Actividad entregada correctamente.');
        closeModal('modal-entregar-actividad');
        
        // Refrescar vistas
        cargarClasesEstudiante();
        cargarPendientesEstudiante();
        cargarTareasEntregadas();
        cargarGradingItems();
    };

    if (file) {
        if (file.size > 1.5 * 1024 * 1024) {
            alert('El archivo es demasiado grande (máximo 1.5 MB para guardar localmente).');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            saveSubmission(e.target.result, file.name);
        };
        reader.onerror = function() {
            alert('Error al leer el archivo de entrega.');
        };
        reader.readAsDataURL(file);
    } else {
        saveSubmission(null, '');
    }
}

// Auto-restaurar sesión al cargar la página si existen datos persistidos
window.addEventListener('DOMContentLoaded', () => {
    if (currentUser && currentRole) {
        setRole(currentRole);
    }
});

/**
 * Elimina un recurso del almacenamiento y actualiza la UI
 */
function eliminarMaterial(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este recurso?')) {
        materiales = materiales.filter(m => m.id !== id);
        localStorage.setItem('materiales', JSON.stringify(materiales));
        cargarMateriales();
    }
}

/**
 * Actualiza la lista de avances de los alumnos para la clase seleccionada
 */
function actualizarAvancesAlumnos() {
    const selectAvances = document.getElementById('avances-clase-select');
    const container = document.getElementById('avances-alumnos-container');
    if (!container) return;
    
    if (!selectAvances || !selectAvances.value) {
        container.innerHTML = '<p style="color: #999; text-align: center; margin: 10px 0;">Selecciona una clase para visualizar los alumnos.</p>';
        return;
    }
    
    const classCode = selectAvances.value;
    const clase = clases.find(c => c.code === classCode);
    if (!clase) {
        container.innerHTML = '<p style="color: #999; text-align: center; margin: 10px 0;">Clase no encontrada.</p>';
        return;
    }
    
    if (!clase.students || clase.students.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; margin: 10px 0;">No hay alumnos inscritos en esta clase.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    clase.students.forEach(studentEmail => {
        const student = registeredUsers.find(u => u.email === studentEmail);
        const name = student ? student.name : studentEmail;
        const matricula = student ? (student.matricula || 'Sin matrícula') : 'Sin matrícula';
        
        const totalActividades = clase.actividades ? clase.actividades.length : 0;
        const entregadas = submissions.filter(s => s.classCode === classCode && s.studentEmail === studentEmail).length;
        const calificadas = submissions.filter(s => s.classCode === classCode && s.studentEmail === studentEmail && s.status === 'calificado').length;
        
        const rowHTML = `
            <div class="student-row" style="cursor: pointer;" onclick="verDetalleAvanceAlumno('${classCode}', '${studentEmail}')">
                <div class="student-info">
                    <span class="student-name"><i class="fa-solid fa-user" style="color: var(--primary-purple); margin-right: 5px;"></i> ${name}</span>
                    <span class="student-sub">Matrícula: <strong>${matricula}</strong> | Correo: ${studentEmail}</span>
                    <span class="student-sub" style="font-size: 11px; margin-top: 3px; color: #4CAF50;"><i class="fa-solid fa-clipboard-check"></i> Entregas: ${entregadas}/${totalActividades} (${calificadas} calificadas)</span>
                </div>
                <div class="row-actions">
                    <button class="row-btn-success" style="padding: 6px 12px; font-size: 12px; display: flex; align-items: center; gap: 4px;" onclick="event.stopPropagation(); verDetalleAvanceAlumno('${classCode}', '${studentEmail}')">
                        <i class="fa-solid fa-eye"></i> Ver Actividades
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += rowHTML;
    });
}

/**
 * Abre el modal con el desglose de entregas y notas del estudiante
 */
function verDetalleAvanceAlumno(classCode, studentEmail) {
    const clase = clases.find(c => c.code === classCode);
    if (!clase) return;
    
    const student = registeredUsers.find(u => u.email === studentEmail);
    const name = student ? student.name : studentEmail;
    const matricula = student ? (student.matricula || 'Sin matrícula') : 'Sin matrícula';
    
    document.getElementById('detalle-alumno-nombre').textContent = name;
    document.getElementById('detalle-alumno-matricula').textContent = matricula;
    
    const listDiv = document.getElementById('detalle-alumno-actividades');
    if (!listDiv) return;
    
    listDiv.innerHTML = '';
    
    if (!clase.actividades || clase.actividades.length === 0) {
        listDiv.innerHTML = '<p style="color: #999; text-align: center; margin: 20px 0;">Esta clase no tiene actividades asignadas.</p>';
        openModal('modal-avances-detalle');
        return;
    }
    
    clase.actividades.forEach(act => {
        const sub = submissions.find(s => s.classCode === classCode && s.activityId === act.id && s.studentEmail === studentEmail);
        
        let statusBadge = '';
        let calificacionText = '';
        let actionsHTML = '';
        
        if (sub) {
            if (sub.status === 'calificado') {
                statusBadge = '<span style="background: #4CAF50; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">Calificado</span>';
                calificacionText = `<span style="color: #FF9800; font-weight: bold;">Nota: ${'⭐'.repeat(parseInt(sub.grade || 5))}</span>`;
                actionsHTML = `
                    <button class="row-btn-success" style="padding: 4px 8px; font-size: 11px; background: #2196F3;" onclick="event.stopPropagation(); openRatingModal('${sub.id}'); closeModal('modal-avances-detalle');">
                        <i class="fa-solid fa-edit"></i> Ver/Editar Nota
                    </button>
                `;
            } else {
                statusBadge = '<span style="background: #FF9800; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">Pendiente Calificar</span>';
                calificacionText = '<span style="color: #FF9800; font-style: italic;">Sin nota aún</span>';
                actionsHTML = `
                    <button class="row-btn-success" style="padding: 4px 8px; font-size: 11px; background: #FF9800;" onclick="event.stopPropagation(); openRatingModal('${sub.id}'); closeModal('modal-avances-detalle');">
                        <i class="fa-solid fa-gavel"></i> Calificar Ahora
                    </button>
                `;
            }
        } else {
            statusBadge = '<span style="background: #f44336; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">Sin Entregar</span>';
            calificacionText = '<span style="color: #f44336; font-weight: bold;">-</span>';
        }
        
        const actHTML = `
            <div style="background: #fdfdfd; border: 1px solid #ddd; border-left: 4px solid ${sub ? '#4CAF50' : '#f44336'}; padding: 12px; margin-bottom: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                <div style="text-align: left; flex: 1;">
                    <strong style="font-size: 14px; color: #333;">${act.titulo}</strong>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">Estado: ${statusBadge} | Calificación: ${calificacionText}</div>
                    ${sub ? `<div style="font-size: 11px; color: #888; margin-top: 4px;">Entregado el: ${sub.date}</div>` : ''}
                </div>
                <div class="row-actions">
                    ${actionsHTML}
                </div>
            </div>
        `;
        listDiv.innerHTML += actHTML;
    });
    
    openModal('modal-avances-detalle');
}
