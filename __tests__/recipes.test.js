require('dotenv').config();

const request = require('supertest');
const app = require('../lib/app');
const connect = require('../lib/utils/connect');
const mongoose = require('mongoose');
const Recipe = require('../lib/models/Recipe');
const Event = require('../lib/models/Event');

describe('app routes', () => {
  beforeAll(() => {
    connect();
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  afterAll(() => {
    return mongoose.connection.close();
  });

  it('creates a recipe', () => {
    return request(app)
      .post('/api/v1/recipes')
      .send({
        name: 'cookies',
        directions: [
          'preheat oven to 375',
          'mix ingredients',
          'put dough on cookie sheet',
          'bake for 10 minutes'
        ],
        ingredients: []
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.any(String),
          name: 'cookies',
          directions: [
            'preheat oven to 375',
            'mix ingredients',
            'put dough on cookie sheet',
            'bake for 10 minutes'
          ],
          ingredients: [],
          __v: 0
        });
      });
  });

  it('gets all recipes', async() => {
    const recipes = await Recipe.create([
      { name: 'cookies', directions: [] },
      { name: 'cake', directions: [] },
      { name: 'pie', directions: [] }
    ]);

    return request(app)
      .get('/api/v1/recipes')
      .then(res => {
        recipes.forEach(recipe => {
          expect(res.body).toContainEqual({
            _id: recipe._id.toString(),
            name: recipe.name
          });
        });
      });
  });

  it('updates a recipe by id', async() => {
    const recipe = await Recipe.create({
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
      ingredients: []
    });

    return request(app)
      .patch(`/api/v1/recipes/${recipe._id}`)
      .send({ name: 'good cookies' })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.any(String),
          name: 'good cookies',
          directions: [
            'preheat oven to 375',
            'mix ingredients',
            'put dough on cookie sheet',
            'bake for 10 minutes'
          ],
          ingredients: [],
          __v: 0
        });
      });
  });

  it('can get a single recipe', async() => {
    const date = new Date;
    const recipe = await Recipe.create({
      name: 'food',
      directions: [
        'open the fidge',
        'pick something',
        'if its in a package, unwrap',
        'eat'
      ],
      ingredients: []
    });
    const event = await Event.create({
      recipeId: recipe._id,
      date: date,
      notes: 'diff every time I make',
      rating: 'hard to say'
    });

    return request(app)
      .get(`/api/v1/recipes/${recipe._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: recipe._id.toString(),
          name: 'food',
          directions: [
            'open the fidge',
            'pick something',
            'if its in a package, unwrap',
            'eat'
          ],
          ingredients: [],
          events: [{
            _id: event._id.toString(),
            __v: 0,
            recipeId: recipe._id.toString(),
            date: date.toISOString(),
            notes: 'diff every time I make',
            rating: 'hard to say'
          }],
          __v: 0,
        });
      });
  });

  it('can delete a recipe', async() => {
    const recipe = await Recipe.create({
      name: 'rotten food',
      directions: [
        'ewww who left this out?',
        'should i eat it?',
        'na throw it away'
      ],
      ingredients: []
    });
    return request(app)
      .del(`/api/v1/recipes/${recipe._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.any(String),
          name: 'rotten food',
          directions: [
            'ewww who left this out?',
            'should i eat it?',
            'na throw it away'
          ],
          ingredients: [],
          __v: 0
        });
      });
  });
});
