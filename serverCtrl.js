
module.exports = function (server) {

    const ADMIN = "admin";
    const USER = "user";

    // Socket.io
    var io = require('socket.io')(server);

    // io.use(function (socket, next) {
    //     sessionMiddleware(socket.request, socket.request.res, next);
    // });    

    const questionsRepo = require('./questions');

    // var questions = questionsRepo.getAll();

    var users = [];

    // var users_questions = {};

    var users_sortudos = [];

    var i = 1;

    io.on('connection', function (socket) {
        socket.on('login', ({ nome, email, type }) => {

            let user = userJoin(socket.id, nome, email, type);

            // console.debug(user['email']);
            // console.debug(` => ${users.length} user(s) connected.`);
            // console.log("cookie:",socket.request.headers.cookie);

            if (user['email']) {

                io.emit('admin_users', users);
                io.emit('admin_perguntas', questionsRepo.getAll());
                io.emit('admin_sortudos', users_sortudos);




                if (questionsRepo.getByStatus(true)) {
                    socket.emit('user_prev_perguntas', questionsRepo.getAll().filter(q => q.status && !q.users.includes(user.email)));
                }

                socket.on('enviar_pergunta', qId => {
                    io.emit('admin_users', users);
                    let q = questionsRepo.getById(qId);
                    questionsRepo.updateOne(q, "status", true);
                    console.log("<<== update finish.");
                    io.emit('user_pergunta', q);
                    io.emit('admin_perguntas', questionsRepo.getAll());
                });


                socket.on('resp', (res, qId) => {
                    let user = currentUser(socket.id);
                    let q = questionsRepo.getById(qId);

                    q["users"].push(user.email);
                    questionsRepo.updateOne(qId, "users", q["users"]);
                    console.log("<<== update finish.");

                    if (!q["votes"][res])
                        q["votes"][res] = 1
                    else
                        q["votes"][res] += 1

                    questionsRepo.updateOne(qId, "votes", q["votes"]);
                    console.log("<<== update finish.");
                    io.emit('admin_users', users);
                    io.emit('admin_perguntas', questionsRepo.getAll());

                });

                socket.on("admin_reabrir_enquete", () => {
                    questionsRepo.updateAll();
                    console.log("<<== update finish.");
                    users_sortudos = [];
                    io.emit('admin_perguntas', questionsRepo.getAll());
                    io.emit('user_reabrir_enquete');
                    io.emit('admin_sortudos', users_sortudos);
                });

                socket.on('admin_sortear', () => {
                    user = userSortear();
                    if (user) {
                        console.log(user);
                        // io.sockets.socket(user.id).emit("user_sortudo", user);
                        io.emit("user_sortudo", user);
                        users_sortudos.push(user);
                        socket.emit('admin_sortudos', users_sortudos);
                    }else{
                        socket.emit('admin_sortudos_finalizou');
                    }
                });

                socket.on('admin_nova_pergunta', qnew => {
                    questionsRepo.create(qnew);
                    io.emit('admin_perguntas', questionsRepo.getAll());
                });

            } else {
                socket.emit('error_login');
            }

        });

        socket.on('disconnect', () => {

            removeUser(socket.id);

            // console.debug(` <= ${users.length} user(s) connected.`);

            // socket.broadcast.emit('admin', users);
            io.emit('admin_users', users);
        });

    });


    // User Ctrl

    function userJoin(id, nome, email, type) {

        let user = { "id": id, "name": nome, "email": email, "type": type, "is_voted": {}, 'is_sort': false };
        if (type != ADMIN) {
            users.push(user);
        }

        return user;
    }

    function removeUser(id) {
        const index = users.findIndex(user => user.id === id);

        // console.log("removendo:",users[index]);

        if (index !== -1) {
            users.splice(index, 1)[0];
        }
    }

    function currentUser(id) {
        return users.find(user => user.id === id);
    }

    function userSortear() {

        let usersCopy = [];

        for (i = 0; i < users.length; i++) {
            if (users[i].type != ADMIN && !users[i].is_sort)
                usersCopy.push(users[i]);
        }

        if (usersCopy.length > 0) {
            let randomIndex = parseInt(Math.random() * usersCopy.length);
            usersCopy[randomIndex].is_sort = true;
            return usersCopy[randomIndex];
        }
        return null;
    }

    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    function shuffle(array) {
        let currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

};
