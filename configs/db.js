import { Sequelize } from "sequelize";

const db = new Sequelize('inventaris_db', 'root', '', {
    host:'localhost',
    dialect:'mysql'
})

export default db;