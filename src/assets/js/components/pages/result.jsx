var ResultPage = React.createClass({
  getInitialState: function() {
    return {
      title: this.props.InitResultData.title,
      tiles: this.props.InitResultData.tiles,
      searchParams: this.props.InitResultData.searchParams,
      searchResultLength: this.props.InitResultData.searchResultLength,
      searchResult: this.props.InitResultData.searchResult,
      iconSpriteMap: this.props.InitResultData.iconSpriteMap
    };
  },
  render: function() {
    return (
      <div>
        <NavBar InitResultData={this.state}/>
        {(this.props.InitResultData.searchResultLength
            ? <Buckets tiles={this.state.tiles} searchResultLength={this.state.searchResultLength}/>
            : <NotFound departure={this.props.InitResultData.departure} arrival={this.props.InitResultData.arrival} />
        )}
        <ResultList InitResultData={this.state} />
      </div>
    )
  }
});



function renderResultPage(InitResultData) {
  if ($('#resultpage').length) {
    ReactContentRenderer.render(<ResultPage InitResultData = {InitResultData}/>, $('#resultpage'));
  }
}

$(document).ready(function() {
  if (typeof InitResultData != 'undefined') {
    renderResultPage(InitResultData);
  }
});
