import React from 'react';

let StaticBlog = React.createClass({

  render: function () {
    return (
      <div>
        <div className="content static blog">
          <h1 className="skeleton">Blog Content</h1>
        </div>
      </div>
    )
  }
});

export default StaticBlog;
