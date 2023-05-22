module.exports=(sequelize,Sequelize)=>{
    const templates=sequelize.define('templates',{
        id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            autoIncrement:true,
            primaryKey:true
        },
        title:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        subject:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        body:{
            type:Sequelize.TEXT,
            allowNull:false,
        },
    });
    return templates;
}