const showView = (extensions) => {
    let view = "";
    if (extensions.length < 1) {
        view += /* html */ `
            <tr>
                <td colspan="4">
                    <div
                        class="alert alert-danger fw-bold text-center mt-3"
                        role="alert"
                    >
                        Extension not found!
                    </div>
                </td>
            </tr>
        `;
    } else {
        extensions.forEach((extension, i) => {
            view += /* html */ `
                <tr>
                    <th scope="row">
                        ${i + 1}
                    </th>
                    <td>
                        ${extension.name}
                    </td>
                    <td>
                        ${extension.author}
                    </td>
                    <td>
                        <a href="/edit/${
                            extension.name
                        }" class="btn btn-success badge rounded-pill">
                            <i class="bi bi-pencil-square"></i>
                            Edit
                        </a>
                        <form action="/${
                            extension.name
                        }?_method=DELETE" method="POST" class="d-inline">
                            <button type="submit" class="btn btn-danger badge rounded-pill" onclick="return confirm('Are you sure want to delete this extension?')">
                                <i class="bi bi-trash"></i>
                                Delete
                            </button>
                        </form>
                    </td>
                </tr>
            `;
        });
    }
    return view;
};
