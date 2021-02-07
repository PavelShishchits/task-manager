const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/db/models/Task');
const { userOne, userTwo, taskOne, setupDatabase } = require('./fixtures/db');

describe('Task', () => {

    beforeEach(setupDatabase);

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

    it('Should return all task for a user', async () => {
        // toDo test sort, filter
        const response = await request(app).get('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200);
        expect(response.body).toHaveLength(2);
    });

    it('Should delete task that belongs to user', async () => {
       await request(app).delete(`/tasks/${taskOne._id}`)
           .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
           .send()
           .expect(200);
       const tasks = await Task.find({owner: userOne._id});
       expect(tasks).toHaveLength(1);
    });

    it('Should not delete other users tasks', async () => {
        await request(app).delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send()
            .expect(404);
        const task = await Task.findById(taskOne._id);
        expect(task).not.toBeNull();
    });

    // Todo

    // Should not signup user with invalid name/email/password
    // Should not update user if unauthenticated
    // Should not update user with invalid name/email/password
    // Should not delete user if unauthenticated

    //
    // Task Test Ideas
    //
    // Should not create task with invalid description/completed
    // Should not update task with invalid description/completed
    // Should delete user task
    // Should not delete task if unauthenticated
    // Should not update other users task
    // Should fetch user task by id
    // Should not fetch user task by id if unauthenticated
    // Should not fetch other users task by id
    // Should fetch only completed tasks
    // Should fetch only incomplete tasks
    // Should sort tasks by description/completed/createdAt/updatedAt
    // Should fetch page of tasks
});