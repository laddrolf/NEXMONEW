$(function () {
    $("body").delegate(".btn-history-remove", "click", function () {
        let id = $(this).attr("data-id");
        $.ajax({
            url: '/removeSMSHistory/' + id,
            method: 'GET',
            success: function (res) {
                loadSMSHistory();
            }
        })
    });
    $('#customerTable').DataTable();
    $('.dataTables_length').addClass('bs-select');

    loadSMSHistory();

    $("#s-phone").select2({
        tags: true
    });

    jQuery.validator.addMethod("phoneType", function (value, element) {
        if (value == "") return false;
        if (value[0] != "+") return false;
        for (let i = 1; i < value.length; i++) {
            if (value[i] < '0' || value[i] > '9') return false;
        }
        return true;
    });

    $("form[name='registration']").validate({
        rules: {
            name: "required",
            phone: {
                required: true,
                phoneType: true
            },
            address: "required",
            zipCode: "required",
            tags: "required",
        },
        messages: {
            name: "Please enter username",
            phone: "Please enter valid phone number",
            address: "Please enter address",
            zipCode: "Please enter zip code",
            tags: "Please enther tags"
        },
        submitHandler: function (form) {
            form.submit();
        }
    });

    $("form[name='edit']").validate({
        rules: {
            name: "required",
            phone: {
                required: true,
                phoneType: true
            },
            address: "required",
            zipCode: "required",
            tags: "required",
        },
        messages: {
            name: "Please enter username",
            phone: "Please enter valid phone number",
            address: "Please enter address",
            zipCode: "Please enter zip code",
            tags: "Please enther tags"
        },
        submitHandler: function (form) {
            form.submit();
        }
    });

    jQuery.validator.addMethod("senderIDType", function (value, element) {
        if (value == "") return false;
        let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+";
        for (let i = 0; i < value.length; i++) {
            if (str.includes(value[i]) == false) return false;
        }
        return true;
    });

    jQuery.validator.addMethod("textType", function (value, element) {
        if (value == "") return false;
        if (value.length > 200) return false;
        return true;
    });

    jQuery.validator.addMethod("multiPhoneType", function (phones, element) {
        if (phones == [] || phones == "") return false;
        for (let i = 0; i < phones.length; i++) {
            let phone = phones[i];
            if (phone[0] == "0") phone = "+46" + phone.slice(1, phone.length);
            if (phone[0] != "+") return false;
            phone = phone.replace(/\s/g, '').replace('-', '').replace('(', '').replace(')', '');
            for (let j = 1; j < phone.length; j++) {
                if (phone[j] < '0' || phone[j] > '9') return false;
            }
        }
        return true;
    });

    $("#sendSMSForm").validate({
        rules: {
            senderID: {
                required: true,
                senderIDType: true
            },
            phone: {
                required: true,
                multiPhoneType: true
            },
            text: {
                required: true,
                textType: true
            }
        },
        messages: {
            senderID: {
                required: "Please enter sender ID",
                senderIDType: "Sender ID must include characters and numbers"
            },
            phone: "Please enter valid phone number(s)",
            text: {
                required: "Please enter text",
                textType: "Text should be less than 140 characters."
            }
        },
        submitHandler: function (form) {
            $("#sendSMSModal").modal('hide');
            let text = $("#s-text").val();
            let phones = $("#s-phone").val();
            let senderID = $("#s-senderID").val();
            let fixed_phones = [];
            for (let i = 0; i < phones.length; i++) {
                let phone = phones[i];
                if (phone[0] == "0") phone = "+46" + phone.slice(1, phone.length);
                phone = phone.replace(/\s/g, '').replace('-', '').replace('(', '').replace(')', '');
                fixed_phones.push(phone)
            }
            loadSMSHistory();
            for (let i = 0; i < fixed_phones.length; i++) {
                let phone = fixed_phones[i];
                $.ajax({
                    url: '/sendSMS',
                    method: 'POST',
                    data: {
                        phone: phone,
                        text: text,
                        senderID: senderID
                    },
                    success: function (res) {
                        loadSMSHistory();
                        if (res.status) {
                            $.toast({
                                heading: 'Success',
                                text: "SMS sent successfully to " + res.phone,
                                showHideTransition: 'slide',
                                icon: 'success'
                            })
                        } else {
                            $.toast({
                                heading: 'Error',
                                text: res.message,
                                showHideTransition: 'fade',
                                icon: 'error'
                            })
                        }
                    }
                })
            }


        }
    });

    $(".edit-customer").click(function () {
        let id = $(this).attr("data-customerID");
        $.ajax({
            url: '/getCustomer/' + id,
            method: 'GET',
            success: function (res) {
                let customer = res.customer;
                $("#customerID").val(customer._id);
                $("#name").val(customer.name);
                $("#phone").val(customer.phone);
                $("#address").val(customer.address);
                $("#zipCode").val(customer.zipCode);
                $("#tags").val(customer.tags);
                $("#editModal").modal();
            }
        })
    })

    $(".remove-customer").click(function () {
        let id = $(this).attr("data-customerID");
        swal({
            title: "Are you sure?",
            text: "This coustomer will be removed permanently",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        },
            function () {
                location.href = "/removeCustomer/" + id;
            });


    })

    $(".send-sms").click(function () {
        $("#customerName").html('');
        $("#s-phone").val('');
        $("#s-text").val('');
        $("#s-senderID").val('');
        $("#sendSMSModal").modal();
    })

    $(".send-sms-customer").click(function () {
        let customerName = $(this).attr("data-customerName");
        let phone = $(this).attr("data-phone");
        console.log(phone);
        $("#customerName").html("To: " + customerName);
        var newOption = new Option(phone, phone, true, true);
        $('#s-phone').append(newOption).trigger('change');
        $("#s-text").val('');
        $("#s-senderID").val('');
        $("#sendSMSModal").modal();
    })

    function loadSMSHistory() {
        $.ajax({
            url: '/getSMSHistory',
            method: 'GET',
            success: function (res) {
                let history = res.history;
                let tbody = ``;
                $("#history-body").html('');
                $('#historyTable').DataTable().destroy();
                for (let i = 0; i < history.length; i++) {
                    let text = (history[i].text) ? history[i].text.slice(0, 25) : '';
                    let datetime = new Date(history[i].timestamp).toLocaleString();
                    tbody = tbody +
                        `<tr>
                            <td>${i + 1}</td>
                            <td>${history[i].phone}</td>
                            <td>${history[i].customerName}</td>
                            <td>${history[i].senderID}</td>
                            <td>${history[i].price}</td>
                            <td>${history[i].network}</td>
                            <td>${text}</td>
                            <td>
                                <div class="badge badge-success">Sent</div>
                            </td>
                            <td>${datetime}</td>
                            <td><i title="remove history" data-id="${history[i]._id}" class="fa fa-trash text-danger btn-icon btn-history-remove"></i></td>
                        </tr>`
                }
                $("#history-body").html(tbody);
                $('#historyTable').DataTable();
            }
        })
    }

    $("#remove-all-history").click(function () {
        swal({
            title: "Are you sure?",
            text: "All SMS history will be deleted permanently",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        },
            function () {
                $.ajax({
                    url: '/removeAllSMSHistory',
                    method: 'GET',
                    success: function (res) {
                        loadSMSHistory();
                    }
                })
            });
    })

})
