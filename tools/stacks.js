const database = require('../data/database.json')
const stacks = new Set(database.flatMap(company => company.jobs.flatMap(job => job.projects.flatMap(project => project.stack))))
console.log(stacks)