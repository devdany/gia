String.prototype.replaceAll = function(org, dest) {
    return this.split(org).join(dest);
}

const sizes = {
    slide1: '1920 x 740',
    slide2: '1920 x 740',
    service: '370 x 540',
    factor: '1920 x 254',
    greeting: '570 x 442',
    vm: '570 x 442',
    registerClass: '870 x 501',
    registerTeacher: '600 x 705',
    teacherIntro: '570 x 670',
    greeting_back: '1920 x 340',
    vm_back: '1920 x 340',
    faculty_back: '1920 x 340',
    fee_back: '1920 x 340',
    application_back: '1920 x 340',
    notice_back: '1920 x 340',
    employment_back: '1920 x 340',
    classInfo_back: '1920 x 340',
}



Dropzone.options.myAwesomeDropzone = {
    maxFiles: 1,
    accept: function(file, done) {
        done();
    },
    params:{
        target: 'target'
    },
    paramName: 'photo',
    init: function() {
        this.on("maxfilesexceeded", function(file){
            alert("No more files please!");
        });

        this.on('success', function(file, res) {
            // 파일이 서버에 업로드가 완료 되었 을때

            $("#imageModal").modal('hide');
            var temp = res.split(',');
            var target = temp[0];
            var url = temp[1];
            $("#isUpload").val('true');
            if(target ==='slide1' || target==='slide2' || target==='factor' || target.split('_')[1] ==='back'){
                location.reload();
            } else {
                var unique = $.now();
                $('#'+target).attr('src', '/img/'+url+'?'+unique);
            }

        });
        var _this = this;

        $(".img_change").click(function () {
            _this.removeAllFiles();
        })
    }
};

$(".admin_slider").hover(function () {

    $(".slides").css('opacity', '0.5');
    $("#buttonArea").css('display', 'block');
}, function () {
    $(".slides").css('opacity', '1');
    $("#buttonArea").css('display', 'none');
})

$("#service_img_area").hover(function () {
    $("#service_image").css('opacity', '0.5');
    $("#service_bt").css('display', 'block');
}, function () {
    $("#service_image").css('opacity', '1');
    $("#service_bt").css('display', 'none');
})


$("#slide_text1_change").click(function () {
    var title = $("#slide1_title").text();
    var text = $("#slide1_text").text();
    var target = this.name;

    $("#modal_title").text(target);
    $("#modal_content_title").val(title);
    $("#modal_content_text").val(text);

    $("#myModal").modal('show');
})

$("#slide_text2_change").click(function () {
    var title = $("#slide2_title").text();
    var text = $("#slide2_text").text();
    var target = this.name;

    $("#modal_title").text(target);
    $("#modal_content_title").val(title);
    $("#modal_content_text").val(text);

    $("#myModal").modal('show');
})

$(".img_change").click(function () {
    var target = this.name;
    $("#img_modal_title").text(target+' ('+sizes[target]+')');
    Dropzone.options.myAwesomeDropzone.params.target = target;

    $("#imageModal").modal('show');
})

$(".factor-area").hover(function () {

    $(".fun-factor-area").css('opacity', '0.5');
    $("#factor_bt").css('display', 'block');
}, function () {
    $(".fun-factor-area").css('opacity', '1');
    $("#factor_bt").css('display', 'none');
})


$("#greeting_img_area").hover(function () {
    $(".skill-image").css('opacity', '0.5');
    $("#greeting_bt").css('display', 'block');
}, function () {
    $(".skill-image").css('opacity', '1');
    $("#greeting_bt").css('display', 'none');
})

$("#vm_img_area").hover(function () {
    $(".vm-image").css('opacity', '0.5');
    $("#vm_bt").css('display', 'block');
}, function () {
    $(".vm-image").css('opacity', '1');
    $("#vm_bt").css('display', 'none');
})

$(".skill-and-experience-area").hover(function () {
    $("#skill_area").css('opacity', '0.5');
    $("#greeting_skill_bt").css('display', 'block');
}, function () {
    $("#skill_area").css('opacity', '1');
    $("#greeting_skill_bt").css('display', 'none');
})

$("#greeting_skill_bt").click(function () {

    var target = this.name;

    $("#skill1").val($("#greeting_skill1").text().replaceAll('%',''));
    $("#skill2").val($("#greeting_skill2").text().replaceAll('%',''));
    $("#skill3").val($("#greeting_skill3").text().replaceAll('%',''));
    $("#skill4").val($("#greeting_skill4").text().replaceAll('%',''));
    $("#skill5").val($("#greeting_skill5").text().replaceAll('%',''));
    $("#skill6").val($("#greeting_skill6").text().replaceAll('%',''));
    $("#skill7").val($("#greeting_skill7").text().replaceAll('%',''));
    $("#skill8").val($("#greeting_skill8").text().replaceAll('%',''));
    $("#modal_title").text(target);

    $("#myModal").modal('show');
})

function isNotSkill(skill){

    return (isNaN(skill) || skill <=29 || skill>100);
}

$("#greeting_skill_ok").click(function () {
    var skill1 = $("#skill1").val().trim();
    var skill2 = $("#skill2").val().trim();
    var skill3 = $("#skill3").val().trim();
    var skill4 = $("#skill4").val().trim();
    var skill5 = $("#skill5").val().trim();
    var skill6 = $("#skill6").val().trim();
    var skill7 = $("#skill7").val().trim();
    var skill8 = $("#skill8").val().trim();

    if(isNotSkill(skill1)||isNotSkill(skill2)||isNotSkill(skill3)||isNotSkill(skill4)||isNotSkill(skill5)||isNotSkill(skill6)||isNotSkill(skill7)||isNotSkill(skill8)){
        alert('입력창에는 1~100까지의 숫자만 들어갈 수 있습니다!(공백도 허용되지 않습니다.)')

    }else{
        if(confirm('정말 스킬정보를 변경하시겠습니까?')){
            var target = $("#modal_title").text();

            $.ajax({
                url: '/admin/update',
                type: 'POST',
                data: {skill1: skill1, skill2: skill2, skill3: skill3, skill4:skill4, skill5: skill5, skill6: skill6, skill7: skill7, skill8: skill8, target:target}
            }).done(function (result) {
                if(result === 'success') {
                    location.reload();

                }else{
                    console.error(result);
                }
            }).fail(function (err) {
                console.error(err);
            });

        }
    }
})


$("#change_ok").click(function () {
    if (confirm('정말 변경 하시겠습니까?')) {
        var title = $("#modal_content_title").val();
        var content = $("#modal_content_text").val();
        var target = $("#modal_title").text();

        $.ajax({
            url: '/admin/update',
            type: 'POST',
            data: {title: title, content: content, target:target}
        }).done(function (result) {
            if(result === 'success') {
                $("#"+target+"_title").text(title);
                $("#"+target+"_text").text(content);
            }else{
                console.error(result);
            }
        }).fail(function (err) {
            console.error(err);
        });
    }
})

$("#register_img_area").hover(function () {
    $("#register_img").css('opacity', '0.5');
    $("#registerClass_bt").css('display', 'block');
}, function () {
    $("#register_img").css('opacity', '1');
    $("#registerClass_bt").css('display', 'none');
})



$("#register_teacher_img_area").hover(function () {
    $(".teacher-details-image").css('opacity', '0.5');
    $("#registerTeacher_bt").css('display', 'block');
}, function () {
    $(".teacher-details-image").css('opacity', '1');
    $("#registerTeacher_bt").css('display', 'none');
})

$(".selected-table").click(function () {
    $("#schedule_code").val(this.id);
    $("#myModal").modal('show');
})

$("#add_schedule_submit").click(function () {
    if (confirm('정말 시간표를 추가 하시겠습니까?')) {
        var code = $("#schedule_code").val();
        var classname = $("#schedule_class option:selected").val();

        $.ajax({
            url: '/admin/addSchedule',
            type: 'POST',
            data: {code: code, classname:classname}
        }).done(function (result) {
            if(result.message === 'success') {
                $("#"+code).append(
                    `<span class="schedule_attr" id="${result.no}">${classname}</span><br>`
                )
                alert('success!');
            }else{
                alert(result);
            }
        }).fail(function (err) {
            console.error(err);
        });
    }
})

$("#teacher_service_area").hover(function(){
    $("#teacher_bt").css('display', 'block')
    $("#teacher_imgs").css('opacity', '0.5')
}, function () {
    $("#teacher_bt").css('display', 'none')
    $("#teacher_imgs").css('opacity', '1.0')
})

$(document).on('click', '.schedule_attr', function (e) {
    var id = this.id;
    var _this = $(this);
    if(confirm('Are you sure delete schedule?')){
        $('#myModal').modal('hide')
        $.ajax({
            url: '/admin/deleteSchedule',
            type: 'POST',
            data: {no: id}
        }).done(function (result) {
            if(result === 'success') {
                _this.remove();
                alert('success!');
            }else{
                alert(result);
            }
        }).fail(function (err) {
            console.error(err);
        });
    }else{
        $('#myModal').modal('hide')
    }

})

$("#back").click(function () {

})


