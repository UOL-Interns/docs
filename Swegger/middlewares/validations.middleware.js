const Yup = require('yup');

// validate lead object from request body
exports.validateLead =async (lead,onSucess,onError) => {
    const schema = Yup.object().shape({
        companyName: Yup.string().required("Company Name is required"),
        companyBusinessWebsite: Yup.string().required("Business Website id required"),
        firstName: Yup.string().required("First name is required"),
        lastName: Yup.string().required(),
        title: Yup.string().required(),
        email: Yup.string().email().required(),
        recentJobPost: Yup.string().required(),
        sourceOfLead: Yup.string().required(),
        jobPostingLink: Yup.string().required(),
        industry: Yup.string().required(),
        companySize: Yup.string().required(),
        companySize: Yup.string().required(),
        companyLinkdin: Yup.string().required(),
        personLinkedin: Yup.string().required(),
        leadStatus: Yup.string().required(),
        country: Yup.string().required(),
        sector: Yup.string().required(),
    });
    try {
        await schema.validate(lead);
        onSucess(lead);
    } catch (error) {
        onError(error);
    }    
}

exports.validateTemplate =async (template,onSucess,onError) => {
    const schema = Yup.object().shape({
        title: Yup.string().required(),
        subject: Yup.string().required(),
        body: Yup.string().required(),
    });
    try {
        await schema.validate(template);
        onSucess(template);
    } catch (error) {
        onError(template);
    }    
}