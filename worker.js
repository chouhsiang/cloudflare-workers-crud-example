import html from "index.html"
import index2 from "index2.html"
import update from "update.html"
import insert from "insert.html"

export default {
  async fetch(request, env, ctx) {
    try {

      var url = new URL(request.url);
      if (url.pathname == "/home") {
        const value = await env.HW.get("name");
        return new Response("you are " + value);

      } else if (url.pathname == "/write" && request.method === "POST") {
        const formData = await request.formData();
        var id = formData.get("id");
        var value = { mail: formData.get("mail"), phone: formData.get("phone") };
        await env.HW.put(id, JSON.stringify(value));
        return Response.redirect("https://" + url.host + "/index.html", 302);
      } else if (url.pathname == "/list") {
        var key = await env.HW.list() || [];
        let html = '<style>table,th,td {border: 1px solid black;}</style><table style="width:40%"><tr><th>ID</th><th>電子信箱</th><th>電話</th><th>編輯</th><th>刪除</th></tr>';
        for (var i of key.keys) {
          var id = i.name;
          var value = JSON.parse(await env.HW.get(id));
          var phone = value.phone;
          var mail = value.mail;
          html += `<tr><td>${id}</td><td>${phone}</td><td>${mail}</td>` +
            '<td style="text-align: center;"><a href="/update.html?i=' + i.name + '">編輯</a></td>' +
            '<td style="text-align: center;"><button onclick="delNumber(' + i.name + ')">按鈕</button></td></tr>';
        }
        html += "</table>";
        return new Response(html, {
          headers: {
            "content-type": "text/html;charset=UTF-8",
          },
        });

      } else if (url.pathname == "/index.html") {
        var key = await env.HW.list() || [];
        let html = '';
        for (var i of key.keys) {
          var id = i.name;
          var value = JSON.parse(await env.HW.get(id));
          if (value) {
            var phone = value.phone;
            var mail = value.mail;
            html += `<tr>
            <td>${id}</td>
            <td>${phone}</td>
            <td>${mail}</td> 
            <td><a href="/update.html?i=${i.name}">編輯</a></td>
            <td>
              <form action="/delete" method="post">
                <input type="hidden" name="id" value="${i.name}" />
                <input type="submit" value="刪除"/> 
              </form>
            </td>
          </tr>`;
          }
        }
        var result = index2.replace("${table}", html);
        return new Response(result, {
          headers: {
            "content-type": "text/html;charset=UTF-8",
          },
        });

      } else if (url.pathname == "/insert.html") {
        return new Response(insert, {
          headers: {
            "content-type": "text/html;charset=UTF-8",
          },
        });

      } else if (url.pathname == "/update.html") {
        // get KV get
        var update_id = url.searchParams.get("i");
        // use kv key get value
        var json = JSON.parse(await env.HW.get(update_id));
        var update_mail = json.mail;
        var update_phone = json.phone;
        console.log(update_id, update_mail, update_phone);
        var result = update.replace("${id}", update_id).replace("${mail}", update_mail).replace("${phone}", update_phone)
        return new Response(result, {
          headers: {
            "content-type": "text/html;charset=UTF-8",
          },
        });
      } else if (url.pathname == "/") {
        return Response.redirect("https://" + url.host + "/index.html", 302);
      } else if (url.pathname == "/delete" && request.method === "POST") {

        const formData = await request.formData();
        var id = formData.get("id");
        await env.HW.delete(id);
        return Response.redirect("https://" + url.host + "/index.html", 302);

      }

      return Response.redirect("https://" + url.host + "/index.html", 302);

    } catch (e) {
      return new Response(e);
    }
  },
};
