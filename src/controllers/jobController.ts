import { Request, Response } from 'express';
import { getGoogleSearchResults } from '../services/googleSearch';
import { saveJobData } from '../services/db';
import { crawlUrls } from '../services/crawler';

export async function startCrawling(req: Request, res: Response) {
    try {
        const { query } = req.body;
        const urls = await getGoogleSearchResults(query);
        await crawlUrls(urls);
        res.status(200).json({ message: 'Crawling started' });
    } catch (error) {
        res.status(500).json({ message: 'Error starting crawl', error });
    }
}
