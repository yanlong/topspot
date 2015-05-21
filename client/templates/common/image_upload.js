Template.imageUpload.events({
    'change #image-upload': function(event, template) {
        var self = this;
        var files = event.target.files;
        for (var i = 0, ln = files.length; i < ln; i++) {
            // Images.insert(files[i], function(err, fileObj) {
            //     // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
            // });
            upload(files[i], function (err, url) {
                if (err) return;
                // alert(url)
                template.$('#image-url').val(url)
                template.$('#image-view').attr('src', url)
            });
        }
    }
});

function upload(file, callback) {
    var config = {
        api: 'http://v0.api.upyun.com/',
        bucket: 'caogen-images',
        // 空间的表单 API
        form_api: 'Kabh5NLpK4s80qyV4RyaZIcb1Vg='
    };

    var host = 'http://caogen-images.b0.upaiyun.com/';


    if (!file) {
        throw new Meteor.Error('No file input.');
    }

    var filename = CryptoJS.MD5(file.name + Date.now()).toString().slice(0,10);

    // 计算 policy 和 signature 所需的参数
    // 详情见： http://docs.upyun.com/api/form_api/#表单API接口简介
    var options = {
        bucket: config.bucket,
        expiration: Math.floor(new Date().getTime() / 1000) + 86400,
        'save-key': filename
    };

    var policy = window.btoa(JSON.stringify(options));
    var signature = CryptoJS.MD5(policy + '&' + config.form_api);

    var data = new FormData();
    data.append('policy', policy);
    data.append('signature', signature);
    data.append('file', file);

    var request = new XMLHttpRequest();
    request.open('POST', config.api + options.bucket);

    request.onreadystatechange = function () {
        if (request.readyState == 4) { // 4 = "loaded"
            if (request.status == 200) { // 200 = OK
                // ...our code here...
                callback(null,host+filename);
            } else {
                callback(request.statusText);
            }
        }
    }
    request.send(data);

}