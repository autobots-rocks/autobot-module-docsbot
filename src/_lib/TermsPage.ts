export class TermsPage {

    public results: Array<string>;
    public pages: number;

    public constructor(results: Array<string>, pages: number) {

        this.results = results;
        this.pages = pages;

    }

}
