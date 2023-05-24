module.exports=(sequelize, Sequelize)=>{
    const MasterSheet=sequelize.define("mastersheet",{
        id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            autoIncrement:true,
            primaryKey:true
        },
        firstName:{
            type:Sequelize.STRING,
            allowNull:true,
        },
        lastName:{
            type:Sequelize.STRING,
            allowNull:true,
        },
        jobTitle:{
            type:Sequelize.STRING,
            allowNull:true
        },
        email:{
            type:Sequelize.STRING,
            allowNull:false,
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                  isEmail:true
                },
                unique: {
                    args: true,
                    msg: 'Email address already in use!'
                }
              },
        },
        companyName:{
            type:Sequelize.STRING,
            allowNull:true,
        },
        unSubEmails:{
            type:Sequelize.STRING,
            allowNull:true,
        },
        country:{
            type:Sequelize.STRING,
            allowNull:false
        },
        sector:{
            type:Sequelize.STRING,
            allowNull:false,
        }
    });
    return MasterSheet;
}