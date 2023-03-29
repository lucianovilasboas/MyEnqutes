
module.exports = function (server) {

    const ADMIN = "admin";
    const USER = "user";

    // Socket.io
    var io = require('socket.io')(server);

    // io.use(function (socket, next) {
    //     sessionMiddleware(socket.request, socket.request.res, next);
    // });    

    const questionsRepo = require('./questions');
    const usersRepo = require('./users');

    io.on('connection', function (socket) {
        socket.on('login', ({ nome, email, type }) => {

            let user = userJoin(socket.id, nome, email, type);

            // console.debug("DEBUG", user);
            // console.debug(` => ${users.length} user(s) connected.`);
            // console.log("cookie:",socket.request.headers.cookie);

            if (user['email']) {

                io.emit('admin_users', usersRepo.getAll());
                io.emit('admin_perguntas', questionsRepo.getAll());
                io.emit('admin_sortudos', usersRepo.sortudos());


                if (questionsRepo.getByStatus(true)) {
                    socket.emit('user_prev_perguntas', questionsRepo.getAll().filter(q => q.status && !q.users.includes(user.email)));
                }

                socket.on('enviar_pergunta', qId => {
                    io.emit('admin_users', usersRepo.getAll());
                    let q = questionsRepo.getById(qId);
                    questionsRepo.updateOne(q, "status", true, () => {
                        io.emit('user_pergunta', q);
                        io.emit('admin_perguntas', questionsRepo.getAll());
                    });
                });


                socket.on('user_resp', (res, qId) => {
                    let user = usersRepo.getById(socket.id);
                    let q = questionsRepo.getById(qId);

                    q["users"].push(user.email);
                    questionsRepo.updateOne(qId, "users", q["users"], () => {

                        if (!q["votes"][res])
                            q["votes"][res] = 1
                        else
                            q["votes"][res] += 1

                    });

                    questionsRepo.updateOne(qId, "votes", q["votes"], () => {
                        io.emit('admin_users', usersRepo.getAll());
                        io.emit('admin_perguntas', questionsRepo.getAll());
                    });

                });

                socket.on("admin_reabrir_enquete", () => {
                    questionsRepo.updateAll(() => {

                        usersRepo.clearAll(() => {
                            io.emit('admin_perguntas', questionsRepo.getAll());
                            io.emit('user_reabrir_enquete');
                            io.emit('admin_sortudos', usersRepo.sortudos());
                        });

                    });
                });

                socket.on('admin_sortear', (n) => {
                    n = Math.min(usersRepo.getAll().length, parseInt(n));
                    for (let i = 0; i < n; i++) {
                        user = usersRepo.random();
                        if (user) {
                            usersRepo.updateOne(user, { "is_sort": true }, () => {
                                console.warn(`==>>admin_sortear[${i}]`,);
                            });
                            
                            io.to(user.id).emit("user_sortudo");

                            socket.emit('admin_sortudos', usersRepo.sortudos());
                            socket.emit('admin_users', usersRepo.getAll());

                        } else {
                            socket.emit('admin_sortudos_finalizou');
                            break;
                        }
                    }
                });

                socket.on('admin_nova_pergunta', qnew => {
                    questionsRepo.create(qnew, () => {
                        io.emit('admin_perguntas', questionsRepo.getAll());
                    });

                });

                socket.on('admin_excluir_pergunta', qId => {
                    // console.log('==> admin_excluir_pergunta', qId);
                    questionsRepo.remove(qId, () => {
                        io.emit('admin_perguntas', questionsRepo.getAll());
                        // console.log('====> admin_excluir_pergunta', qId);
                    });
                });

                socket.on('admin_excluir_user', email => {
                    const user = usersRepo.getByEmail(email);
                    usersRepo.remove(user.id, () => {
                        socket.emit('admin_users', usersRepo.getAll());
                        // io.emit('force_disconnect', user);
                        io.to(user.id).emit('force_disconnect');
                    });
                });


                socket.on('admin_formar_grupos', n => {
                    let usuariosCopy  = []; 
                    const usuarios = usersRepo.getAll();
                    for (let i = 0; i < usuarios.length; i++) {
                        if(usuarios[i].type != ADMIN)
                            usuariosCopy.push(usuarios[i]);
                        
                    }

                    usuariosCopy = usersRepo.shuffle(usuariosCopy);

                    const x = Math.floor(usuariosCopy.length / n);
                    // console.info(usuariosCopy.length,n, x);

                    let grupos = []
                    while(usuariosCopy.length > 0){
                        let g = usuariosCopy.splice(0,x); // .map(u=>u.name);
                        grupos.push(g);
                    }

                    // console.log("grupos1:", grupos.map(g => g.length));

                    if(grupos[grupos.length-1].length == 1){
                        grupos[grupos.length-2].push( grupos[grupos.length-1].pop() );
                        grupos.splice(grupos.length-1,1);
                    }

                    // console.log("grupos2:", grupos.map(g => g.length));


                    socket.emit('admin_grupos', grupos);

                    for (let i = 0; i < grupos.length; i++) {
                        for (const u of grupos[i]) {
                            io.to(u.id).emit('user_grupo', (i+1));
                        }
                    }




                });

            } else {
                socket.emit('error_login');
            }

        });


        socket.on('logout', () => {
            let user = usersRepo.getById(socket.id);
            if (user) {
                usersRepo.updateOne(user, { "online": false }, () => {
                    // console.debug("logout", user.id);
                    socket.emit('error_login');
                    io.emit('admin_users', usersRepo.getAll());
                });
            }
        });

        socket.on('disconnect', () => {
            let user = usersRepo.getById(socket.id);
            if (user) {
                usersRepo.updateOne(user, { "online": false }, () => {
                    // console.debug("DISCONNECT", user.id);
                    io.emit('admin_users', usersRepo.getAll());
                });
            }
        });

    });







    // User Ctrl

    function userJoin(id, nome, email, type) {
        let user = usersRepo.getByEmail(email);
        if (user) {
            // usersRepo.updateOne(user, "id", id);
            usersRepo.updateOne(user, { "id": id, "online": true } );
        } else {
            user = { "id": id, "name": nome, "email": email, "type": type, "is_voted": {}, 'is_sort': false, "online": true };
            usersRepo.create(user);
        }
        return user;
    }

};
