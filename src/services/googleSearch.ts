import axios from 'axios';
import cheerio from 'cheerio';

export async function getGoogleSearchResults(query: string): Promise<string[]> {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}+job+openings`;
    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);
    const links: string[] = [];
    $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.startsWith('/url?q=')) {
            links.push(href.split('/url?q=')[1].split('&')[0]);
        }
    });
    return links;
}
