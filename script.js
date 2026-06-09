// ============ FIREBASE ============== 

  import { initializeApp } from 
  "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

  import { 
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
   } from 
   "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

   import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
   } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js"

  const firebaseConfig = {
    apiKey: "AIzaSyDzJmbzatoZl5Ak-mZ9AMo5G02VKcK_qQE",
    authDomain: "site-de-anuncios-8d660.firebaseapp.com",
    projectId: "site-de-anuncios-8d660",
    storageBucket: "site-de-anuncios-8d660.firebasestorage.app",
    messagingSenderId: "849965720689",
    appId: "1:849965720689:web:611fb8460ba5165e7367d0",
    measurementId: "G-EHMZSPBLQJ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  import {
    setPersistence,
    browserSessionPersistence
   } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js"

   // Configura para não manter login após fechar o navegador
   setPersistence(auth, browserSessionPersistence)
   .then(() => {
    console.log("Login só dura enquanto a aba estiver aberta.");
   })
   .catch((error) => {
    console.error("Erro ao configurar persistência:", error);
   });

// ============ SELEÇÃO DE ELEMENTOS ============ 
const listaAnuncios = [];

const btnCadastro = document.getElementById("btn-cadastro");
const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");

const inputEmail = document.getElementById("email");
const inputSenha = document.getElementById("senha");

const usuarioLogadoTexto = document.getElementById("usuario-logado");

const btnMeus = document.getElementById("btn-meus");
const btnTodos = document.getElementById("btn-todos");

const campoBusca = document.getElementById("campo-busca");
const form = document.getElementById("form-anuncio");
const main = document.querySelector("main")
let idEditando = null;

// ============ FUNÇÕES ============ 
function limparNumero(numero) {
    return numero.replace(/\D/g, "");
}

function mostrarMensagem(texto, tipo = "sucesso") {
    const msg = document.getElementById("mensagem");
    msg.textContent = texto;
    msg.className = "mensagem " + tipo + " mostrar";

    setTimeout(() => {
        msg.classList.remove("mostrar");
    }, 3000); // desaparece em 3 segundos
}

function abrirModalConfirmacao(texto, callbackConfirmar) {
    const modal = document.getElementById("modal-confirmacao");
    const modalTexto = document.getElementById("modal-texto");
    const btnConfirmar = document.getElementById("modal-confirmar");
    const btnCancelar = document.getElementById("modal-cancelar");

    modalTexto.textContent = texto;
    modal.style.display = "flex";

    // Remove listeners antigos
    btnConfirmar.onclick = null;
    btnCancelar.onclick = null;

    btnConfirmar.onclick = () => {
        modal.style.display = "none";
        callbackConfirmar();
    };

    btnCancelar.onclick = () => {
        modal.style.display = "none";
    };
}



async function salvarAnuncio(nome, descricao, whatsapp, categoria, imagem) {
    const user = auth.currentUser;

    try {

        if ( idEditando) {
            const referencia = doc(db, "anuncios", idEditando);

            await updateDoc(referencia, {
                nome,
                descricao,
                whatsapp,
                categoria,
                imagem
            });

            idEditando = null;

            mostrarMensagem("Anúncio atualizado!", "sucesso");
        } else {

        
            await addDoc(collection(db, "anuncios"), {
                nome,
                descricao,
                whatsapp,
                categoria,
                imagem,
                usuario: user ? user.email : "anonimo"
            });
            mostrarMensagem("Anúncio salvo na nuvem", "sucesso");
        }

        carregarAnunciosFirebase(); //atualiza a lista
        form.reset();

    } catch (erro) {
    console.error(erro);
    mostrarMensagem("Erro ao salvar", "erro");
    }
}

async function carregarAnunciosFirebase() {
    try {
        main.innerHTML = "<p>Carregando anúncios</p>"

        const querySnapshot = await getDocs(collection(db, "anuncios"));

        listaAnuncios.length = 0;

        querySnapshot.forEach((doc) => {
            listaAnuncios.push({
                id: doc.id,
                ...doc.data()
            });
        });

    renderizarAnuncios(listaAnuncios);

    } catch (erro) {
        console.error("Erro ao carregar:");
        main.innerHTML = "<p>Erro ao carregar anúncios.</p>";
    }
}

function filtrarMeusAnuncios() {
    const user = auth.currentUser;

    if (!user) {
        alert("Faça login primeiro");
        return;
    }

    const meus = listaAnuncios.filter((anuncio) => {
        return anuncio.usuario === user.email;
    });

    renderizarAnuncios(meus);
}

function filtrarAnuncios(textoBusca) {
    return listaAnuncios.filter((anuncio) => {
        return (
            anuncio.nome.toLowerCase().includes(textoBusca.toLowerCase()) ||

            anuncio.descricao.toLowerCase().includes(textoBusca.toLowerCase()) || 
            anuncio.categoria.toLowerCase().includes(textoBusca.toLowerCase())
        );
    });
}

function filtrarCategoria(categoria) {

    if (categoria === "Todos") {
        renderizarAnuncios(listaAnuncios);
        return;
    }

    const filtrados = listaAnuncios.filter((anuncio) => {
        return anuncio.categoria === categoria;
    });

    renderizarAnuncios(filtrados);
}

window.filtrarCategoria = filtrarCategoria;
    


function renderizarAnuncios(lista) {
    main.innerHTML = "";

if (lista.length === 0) {
        main.innerHTML = '<p style="text-align: center; color: #999;">Nenhum anúncio cadastrado.</p>';
        return;
    }
    lista.forEach((anuncio) => {
        const user = auth.currentUser;

        const podeEditar = user && anuncio.usuario === user.email;

        const div = document.createElement("div");
        div.classList.add("anuncio");

        div.innerHTML = `
            ${anuncio.imagem ? `<img src="${anuncio.imagem}" class="imagem-anuncio">` : ""}

            <h2>${anuncio.nome}</h2>
            <p>${anuncio.descricao}</p>
            <p class="categoria"><strong>Categoria:</strong>${anuncio.categoria}</p>

            <p><strong>Criado por:</strong> ${anuncio.usuario}</p>

            <!-- <a class="whatsapp" 
            href="https://wa.me/55${anuncio.whatsapp}?text=Olá,%20vi%20seu%20anúncio%20no%20site%20de%20Serviços%20Locais!" target="_blank">
                Falar no WhatsApp
            </a>-->

            <div class="acoes">

                <a href="https://wa.me/55${anuncio.whatsapp}"
                target="_blank"
                class="whatsapp">
                    Whatsapp
                </a>

                ${podeEditar ? `

                    <button class="editar"
                            data-id="${anuncio.id}">
                        Editar
                    </button>

                    <button class="excluir"
                            data-id="${anuncio.id}">
                        Excluir
                    </button>

                ` : ""}

            </div>
        `;

        main.appendChild(div);
    });
}

function salvarAnuncioComImagem(nome, descricao, whatsapp, categoria, imagem) {
   

    const novoAnuncio = {
        id: Date.now(),
        nome: nome,
        descricao: descricao,
        whatsapp: whatsapp,
        categoria: categoria,
        imagem: imagem
    };

    renderizarAnuncios(listaAnuncios);

    form.reset();

    alert("Anúncio cadastrado com imagem");
}

// ============ EVENTOS ============
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const descricao = document.getElementById("descricao").value;
    const whatsapp = limparNumero(document.getElementById("whatsapp").value);
    const categoria = document.getElementById("categoria").value;

    const imagemInput = document.getElementById("imagem");
    let arquivo = imagemInput.files[0];

    if (!nome.trim() || !whatsapp.trim() || !categoria.trim()) {
        alert("Preencha os campos obrigatórios: Nome, WhatsApp e Categoria.");
        return;
    }

    if (whatsapp.length < 10) {
        alert("WhatsApp inválido. Use DDD + número (mínimo 10 dígitos).");
        return;
    }

    if (arquivo) {
        const reader = new FileReader();

        reader.onload = function(e) {
            salvarAnuncio(nome, descricao, whatsapp, categoria, e.target.result);
        };

        reader.readAsDataURL(arquivo);
    } else {
        salvarAnuncio(nome, descricao, whatsapp, categoria, "");
    }
});

document.querySelectorAll(".filtro-btn").forEach((btn) => {

    btn.addEventListener("click", () => {

        const categoria = btn.dataset.categoria;

        filtrarCategoria(categoria);

    });

});

btnMeus.addEventListener("click", () => {
    filtrarMeusAnuncios();
});

btnTodos.addEventListener("click", () => {
    renderizarAnuncios(listaAnuncios);
})

btnCadastro.addEventListener("click", async () => {
    const email = inputEmail.value.trim();
    const senha = inputSenha.value;

    if (!email || !senha) {
        mostrarMensagem("Preencha email e senha.", "erro");
        return;
    }

    if (senha.length < 6) {
        mostrarMensagem("A senha deve ter no mínimo 6 caracteres.", "erro");
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, senha);
        mostrarMensagem("Usuário criado com sucesso!", "sucesso");

        inputEmail.value = "";
        inputSenha.value = "";
    } catch (erro) {
        console.error(erro);
        if (erro.code === "auth/email-already-in-use") {
            mostrarMensagem("Este email já está cadastrado.", "erro");
        } else if (erro.code === "auth/invalid-email") {
            mostrarMensagem("Email inválido.", "erro");
        } else {
            mostrarMensagem("Erro ao cadastrar: " + erro.message, "erro");
        }
    }
});

btnLogin.addEventListener("click", async () => {
    const email = inputEmail.value.trim();
    const senha = inputSenha.value;

    if (!email || !senha) {
        mostrarMensagem("Preencha email e senha para fazer login.", "erro");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, senha);
        mostrarMensagem("Login realizado com sucesso!", "sucesso");

        inputEmail.value = "";
        inputSenha.value = "";
    } catch (erro) {
        console.error(erro);
        if (erro.code === "auth/user-not-found") {
            mostrarMensagem("Usuário não encontrado. Faça cadastro primeiro.", "erro");
        } else if (erro.code === "auth/wrong-password") {
            mostrarMensagem("Senha incorreta.", "erro");
        } else if (erro.code === "auth/invalid-email") {
            mostrarMensagem("Email inválido.", "erro");
        } else {
            mostrarMensagem("Erro ao fazer login: " + erro.message, "erro");
        }
    }
});

btnLogout.addEventListener("click", async () => {
    await signOut(auth);
    mostrarMensagem("Saiu da conta", "sucesso");
});



campoBusca.addEventListener("input", () => {
    const texto = campoBusca.value.trim();

    if (texto.length < 3) {
        renderizarAnuncios(listaAnuncios);
        return;
    }

    const resultado = filtrarAnuncios(texto);

    renderizarAnuncios(resultado);
});

main.addEventListener("click", async (event) => {

    const botaoEditar = event.target.closest(".editar");
    const botaoExcluir = event.target.closest(".excluir");

    if (botaoEditar) {
        const id = botaoEditar.getAttribute("data-id");

        const anuncio = listaAnuncios.find(a => a.id === id);

        const user = auth.currentUser;

        if (!user || anuncio.usuario !== user.email) {
            mostrarMensagem("Você não pode editar este anúncio", "erro");
            return;
        }

        // Preencher formulário
        document.getElementById("nome").value = anuncio.nome;
        document.getElementById("descricao").value = anuncio.descricao;
        document.getElementById("whatsapp").value = anuncio.whatsapp;
        document.getElementById("categoria").value = anuncio.categoria;

        idEditando = id;

        return;
    }

    if (botaoExcluir) {

        const id = botaoExcluir.getAttribute("data-id");

        const anuncio = listaAnuncios.find(a => a.id === id);

        const user = auth.currentUser;

        if (!user) {
            mostrarMensagem("Você precisa estar logado para excluir anúncios", "erro");
            return;
        }

        if (anuncio.usuario && anuncio.usuario !== user.email) {
            mostrarMensagem("Você não pode excluir este anúncio", "erro");
            return;
        }

        abrirModalConfirmacao(
            "Tem certeza que deseja excluir este anúncio?",
            async () => {

                try {

                    await deleteDoc(doc(db, "anuncios", id));

                    carregarAnunciosFirebase();

                    mostrarMensagem(
                        "Anúncio excluído com sucesso!",
                        "sucesso"
                    );

                } catch (erro) {

                    mostrarMensagem(
                        "Erro ao excluir anúncio",
                        "erro"
                    );

                }
            }
        );
    }
});

const botaoLimpar = document.getElementById("limpar-tudo");

    botaoLimpar.addEventListener("click", async () => {
        const user = auth.currentUser;

        if (!user) {
            mostrarMensagem("Faça login para limpar seus anúncios", "erro");
            return;
        }

        abrirModalConfirmacao("Deseja apagar todos os seus anúncios?", async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "anuncios"));
                querySnapshot.forEach(async (docSnap) => {
                    const anuncio = docSnap.data();
                    if (anuncio.usuario === user.email) {
                        await deleteDoc(doc(db, "anuncios", docSnap.id));
                    }
                });
                carregarAnunciosFirebase();
                mostrarMensagem("Todos os seus anúncios foram apagados.", "sucesso");
            } catch (erro) {
                mostrarMensagem("Erro ao limpar anúncios.", "erro");
        }
    });
});

const formularioSection = document.querySelector(".formulario");
const loginSection = document.querySelector(".login");
onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioLogadoTexto.innerHTML = "Logado como: " + user.email;

        // Esconde toda a seção de login
        loginSection.style.display = "none";

        // Mostra logout
        btnLogout.style.display = "inline-block";

        // Mostra formulário de anúncios
        form.style.display = "block";
        
    } else {
        usuarioLogadoTexto.innerHTML = "Nenhum usuário logado";

        // Mostra seção de login
        loginSection.style.display = "block";

        // Esconde logout
        btnLogout.style.display = "none";

        // Esconde formulário de anúncios
        form.style.display = "none";
    }
});
    carregarAnunciosFirebase();
