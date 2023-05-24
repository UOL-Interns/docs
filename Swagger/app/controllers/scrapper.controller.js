const request = require('request');
const cheerio = require('cheerio');

exports.checkLead = (req, res) => {

  // URL of the business website to scrape
  const url = 'https://www.pbs.gov.pk/content/population-census';

  // Filter keywords to check for
  const filterKeywords = ['spam', 'fake', 'scam'];

  // Make a request to the website and load the HTML into Cheerio
  try {
    request(url, function(error, response, html) {
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(html);
    
          // Extract the text from the website and convert it to lowercase
          const text = $('body').text().toLowerCase();
    
          // Check if any of the filter keywords exist in the text
          const isAccurate = filterKeywords.every(keyword => !text.includes(keyword));
    
          // Return the result
          res.json({ isAccurate });
        } else {
          // Handle any errors
          console.log(error);
          res.status(500).json({ message: 'Error scraping website' });
        }
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
 
};
