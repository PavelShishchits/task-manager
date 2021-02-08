const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/db/models/Task');
const { userOne, userTwo, taskOne, taskTwo, setupDatabase } = require('./fixtures/db');

describe('Task', () => {

    beforeEach(setupDatabase);

    describe('Create task', () => {
        it('Should create new task for a user', async () => {
            const response = await request(app).post('/tasks')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send({
                    description: 'Test description'
                })
                .expect(201)
            const task = await Task.findById(response.body._id);
            expect(task).not.toBeNull();
            expect(task.owner).toEqual(userOne._id);
        });

        it('Should not create task for unauthenticated user', async () => {
            await request(app).post('/tasks')
                .send({
                    description: 'Test description'
                })
                .expect(401)
        });

        it('Should not create task with invalid description/completed', async () => {
           await request(app).post('/tasks')
               .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
               .send({
                   description: 123,
                   completed: '123'
               })
               .expect(500)
        });
    });

    describe('Update task', () => {
       it('Should update task', async () => {
           const response = await request(app).patch(`/tasks/${taskOne._id}`)
               .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
               .send({
                   completed: true
               })
               .expect(200)
           const task = await Task.findById(taskOne._id);
           expect(task.completed).toBe(true);
       });

       it('Should not update task with invalid fields', async () => {
           await request(app).patch(`/tasks/${taskOne._id}`)
               .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
               .send({
                   completed: true,
                   prop: 'test'
               })
               .expect(400)
           const task = await Task.findById(taskOne._id);
           expect(task.completed).toBe(false);
       });
    });

    describe('Delete task', () => {
        it('Should delete task', async () => {
            await request(app).delete(`/tasks/${taskOne._id}`)
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
            const task = await Task.findById(taskOne._id);
            expect(task).toBeNull();
        });

        it('Should not delete task for unauthenticated user', async () => {
            await request(app).delete(`/tasks/${taskOne._id}`)
                .send()
                .expect(401)
        });

        it('Should not delete other users tasks', async () => {
            await request(app).delete(`/tasks/${taskOne._id}`)
                .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
                .send()
                .expect(404);
            const task = await Task.findById(taskOne._id);
            expect(task).not.toBeNull();
        });
    });

    describe('Get task', () => {
        it('Should fetch user task by id', async () => {
           const response = await request(app).get(`/tasks/${taskOne._id}`)
               .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
               .send()
               .expect(200);
           expect(response.body.description).toBe(taskOne.description);
        });

        it('Should not fetch user task by id if unauthenticated', async () => {
            await request(app).get(`/tasks/${taskOne._id}`)
                .send()
                .expect(401);
        });

        it('Should not fetch other users task by id', async () => {
            await request(app).get(`/tasks/${taskOne._id}`)
                .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
                .send()
                .expect(404);
        })

        it('Should fetch all task for a user', async () => {
            // toDo test sort, filter
            const response = await request(app).get('/tasks')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
            expect(response.body).toHaveLength(2);
        });

        it('Should fetch only completed tasks', async () => {
            const response = await request(app).get('/tasks?completed=true')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
            const tasks = response.body.every((item) => item.completed);
            expect(tasks).toBeTruthy();
        });

        it('Should fetch only incomplete tasks', async () => {
            const response = await request(app).get('/tasks?completed=false')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
            const tasks = response.body.every((item) => item.completed === false);
            expect(tasks).toBeTruthy();
        });

        it('Should sort tasks by createdAt (desc)', async () => {
            const response = await request(app).get('/tasks?sortBy=createdAt:desc')
               .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
               .send()
               .expect(200);
            expect(response.body[0].description).toBe(taskTwo.description);
        });
    });
});