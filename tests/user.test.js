const request = require('supertest');
const app = require('../src/app');
const User = require('../src/db/models/User');
const { userOne, setupDatabase } = require('./fixtures/db');

describe('User', () => {

    beforeEach(setupDatabase);

    describe('Sign up, login, logout', () => {

        it('Should sign up new user', async () => {
            const response = await request(app).post('/users').send({
                name: 'Pavel',
                email: 'pavel@gmail.com',
                password: '!1234567'
            }).expect(201)

            const user = await User.findById(response.body.user._id);

            expect(user).not.toBeNull();

            expect(user.password).not.toBe('!1234567');
        });

        it('Should login existing user', async () => {
            const response = await request(app).post('/users/login').send({
                email: userOne.email,
                password: userOne.password,
            }).expect(200);

            const user = await User.findById(userOne._id);
            expect(user.tokens.map((item) => item.token)).toContain(response.body.token);
        });

        it('Should not login with nonexistent user', async () => {
            await request(app).post('/users/login').send({
                email: 'testuser@example.com',
                password: '12345678',
            }).expect(400);
        });

        it('Should logout user correctly', async () => {
            await request(app).post('/users/logout')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200)
            const user = await User.findById(userOne._id);
            expect(user.tokens.map((item) => item.token)).not.toContain(userOne.tokens[0].token);
        });

        it('Should logout user from all devices', async () => {
            await request(app).post('/users/logoutAll')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200)
            const user = await User.findById(userOne._id);
            expect(user.tokens).toHaveLength(0);
        })
    })

    describe('Get user profile', () => {
        it('Should get user profile', async () => {
            await request(app).get('/users/me')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
        });

        it('Should not get profile for unauthenticated user', async () => {
            const response = await request(app).get('/users/me')
                .send()
                .expect(401);
            expect(response.body.error).toBe('Please authenticate');
        });
    });

   describe('Delete user profile', () => {
       it('Should delete user profile', async () => {
           await request(app).delete('/users/me')
               .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
               .send()
               .expect(200);

           const user = await User.findById(userOne._id);
           expect(user).toBeNull()
       });
   });

   describe('User update', () => {
       it('Should update user field', async () => {
           await request(app).patch('/users/me')
               .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
               .send({
                   name: 'VaryaTheCat',
               })
               .expect(200);
           const user = await User.findById(userOne._id);
           expect(user.name).toBe('VaryaTheCat');
       })

       it('Should throw error if updating nonexistent property', async () => {
           await request(app).patch('/users/me')
               .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
               .send({
                   location: 'Minsk',
               })
               .expect(400);
       })
   });

   describe('User avatar', () => {
        it('Should upload user avatar ', async () => {
            await request(app).post('/users/me/avatar')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .attach('avatar', 'tests/fixtures/profile-pic.jpg')
                .expect(200);
            const user = await User.findById(userOne._id);
            expect(user.avatar).toEqual(expect.any(Buffer));
        })

       it('Should delete user avatar', async () => {
           await request(app).delete('/users/me/avatar')
               .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                expect(200);
           const user = await User.findById(userOne._id);
           expect(user.avatar).toBeUndefined();
       })
   });
});