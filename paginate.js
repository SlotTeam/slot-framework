/**
 * Created by cecheveria on 2/9/14.
 */

/*
 public class ResponseBase {
 private int error;
 private String message;
 //public AbstractBean data;
 }
 public class ResponsePage {
 private List  page;
 private int totalRows;
 private int totalPages;
 private int pageSize;
 private int pageNumber;
 }
 PageHelper.getPage(((CommentResponseList) responseObject).getData(), request.getParameterMap());
 PageHelper.getPage(commentResponseList.getData(), 8, 1, 0);
 */

function Page(page) {
    this.page = [];
    this.totalRows = 0;
    this.totalPages = 0;
    this.pageNumber = 0;
    this.pageSize = 0;

    if (page) {
        this.page = page.page ? page.page : [];
        this.totalRows = page.totalRows ? page.totalRows : 0;
        this.totalPages = page.totalPages ? page.totalPages : 0;
        this.pageNumber = page.pageNumber ? page.pageNumber : 0;
        this.pageSize = page.pageSize ? page.pageSize : 0;
    }
}
Page.create = function (page) { return new Page(page); }

function ResponseBase(response) {
    this.data = "";
    this.error = 0;
    this.msg = "";

    if (response) {
        this.error = response.error ? response.error : 0;
        this.msg = response.msg ? response.msg : "";
        this.data = response.data ? response.data : "";
    }
}
ResponseBase.create = function (response) { return new ResponseBase(response); }

function ResponsePage(page) {
    this.data = Page.create();
    this.error = 0;
    this.msg = "";

    if (page) {
        /*if(Object.prototype.toString.call( page ) == "[object Array]") {

        }
        else {*/
            this.data.page = page.page ? page.page : [];
            this.data.totalRows = page.totalRows ? page.totalRows : 0;
            this.data.totalPages = page.totalPages ? page.totalPages : 0;
            this.data.pageNumber = page.pageNumber ? page.pageNumber : 0;
            this.data.pageSize = page.pageSize ? page.pageSize : 0;
        //}
    }
}
ResponsePage.create = function (page) { return new ResponsePage(page); }

function PageHelper() {
}
PageHelper.create = function () { return new PageHelper(); }
PageHelper.prototype.getPage = function (data, pageSize, pageNumber, fromIndex) {
    //
    var responsePage = ResponsePage.create();

    if(!data || data.length == 0) {
        responsePage.data.page = [];
        responsePage.data.totalRows = 0;
        responsePage.data.totalPages = 0;
        responsePage.data.pageNumber = 0;
        responsePage.data.pageSize = 0;
        responsePage.error = !data ? 1 : 0;
        responsePage.msg = !data ? "Undefined data" : "";
    }
    else {
        if(pageNumber <= 0) {
            /**
             * No tenemos parametro pageNumber, entonces enviamos todod el buffer
             */
            //responsePage.page = data;
            responsePage.error = 1;
            responsePage.msg = "Page does not exists, it must be great than cero";
        }
        else {
            var totalPages = 0;
            //
            //totalPages = (int) (pageSize == 1 ? data.size() : (int)(Math.round(((float)data.size()/pageSize) + .499)));
            totalPages = pageSize == 1 ? data.length : (data.length/pageSize) + .499;
            totalPages = Math.round(totalPages);

            /**
             * return page using pageNumber parameter
             */
            if(pageNumber > totalPages) {
                responsePage.data.page = [];
                responsePage.error = 1;
                responsePage.msg = "Page does not exists, it must be less or equal than " + totalPages;
            }
            else {
                fromIndex = (pageNumber-1) * pageSize;
                var toIndex = fromIndex + pageSize < data.length ? fromIndex + pageSize : data.length;

                //responsePage.page = data.subList(fromIndex, toIndex);
                responsePage.data.page = data.slice(fromIndex, toIndex);
            }

            responsePage.data.totalRows = data.length;
            responsePage.data.totalPages = Math.round(totalPages);
            responsePage.data.pageNumber = pageNumber;
            responsePage.data.pageSize = pageSize;
        }
    }

    return responsePage;
}

/*module.exports.util = function () {
    this.prefixFileName = prefixFileName;
    this.upperCaseChar0 = upperCaseChar0;
};*/

/*main.create = function() { return new main(); }
main.prototype.layout = function() { return page.layouts["main"]; }*/

module.exports.Page = Page;
module.exports.ResponseBase = ResponseBase;
module.exports.ResponsePage = ResponsePage;
module.exports.PageHelper = PageHelper;