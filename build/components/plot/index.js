"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var CopyToClipboard = require("react-copy-to-clipboard");
var CSSModules = require("react-css-modules");
var TetherComponent = require("react-tether");
var bookmark_1 = require("../../actions/bookmark");
var shelf_1 = require("../../actions/shelf");
var shelf_preview_1 = require("../../actions/shelf-preview");
var constants_1 = require("../../constants");
var index_1 = require("../field/index");
var index_2 = require("../vega-lite/index");
var bookmarkbutton_1 = require("./bookmarkbutton");
var styles = require("./plot.scss");
var PlotBase = (function (_super) {
    __extends(PlotBase, _super);
    function PlotBase(props) {
        var _this = _super.call(this, props) || this;
        _this.vegaLiteWrapperRefHandler = function (ref) {
            _this.vegaLiteWrapper = ref;
        };
        _this.state = {
            hovered: false,
            preview: false,
            copiedPopupIsOpened: false
        };
        // Bind - https://facebook.github.io/react/docs/handling-events.html
        _this.handleTextChange = _this.handleTextChange.bind(_this);
        _this.onMouseEnter = _this.onMouseEnter.bind(_this);
        _this.onMouseLeave = _this.onMouseLeave.bind(_this);
        _this.onPreviewMouseEnter = _this.onPreviewMouseEnter.bind(_this);
        _this.onPreviewMouseLeave = _this.onPreviewMouseLeave.bind(_this);
        _this.onSpecify = _this.onSpecify.bind(_this);
        return _this;
    }
    PlotBase.prototype.componentDidUpdate = function (prevProps, prevState) {
        // We have to check this here since we do not know if it is vertically overflown
        // during render time.
        if (!this.isVerticallyOverFlown(this.vegaLiteWrapper) && this.state.hovered) {
            // add a padding similar to .plot
            this.vegaLiteWrapper.style.paddingRight = '11px';
        }
        else {
            // reset state otherwise, so we clean up what we add in the case above.
            delete this.vegaLiteWrapper.style.paddingRight;
        }
    };
    PlotBase.prototype.render = function () {
        var _a = this.props, isPlotListItem = _a.isPlotListItem, showBookmarkButton = _a.showBookmarkButton, showSpecifyButton = _a.showSpecifyButton, spec = _a.spec;
        var notesDiv;
        var specKey = JSON.stringify(spec);
        if (this.props.bookmark.dict[specKey]) {
            notesDiv = (React.createElement("textarea", { styleName: 'note', type: 'text', placeholder: 'notes', value: this.props.bookmark.dict[specKey].note, onChange: this.handleTextChange }));
        }
        return (React.createElement("div", { styleName: isPlotListItem ? 'plot-list-item-group' : 'plot-group' },
            React.createElement("div", { styleName: "plot-info" },
                React.createElement("div", { styleName: "command-toolbox" },
                    showSpecifyButton && this.specifyButton(),
                    showBookmarkButton && this.bookmarkButton(),
                    React.createElement("span", { styleName: 'command' },
                        React.createElement(TetherComponent, { attachment: 'bottom left', offset: '0px 30px' },
                            this.copySpecButton(),
                            this.state.copiedPopupIsOpened && React.createElement("span", { styleName: 'copied' }, "copied")))),
                React.createElement("span", { onMouseEnter: this.onPreviewMouseEnter, onMouseLeave: this.onPreviewMouseLeave }, this.fields())),
            React.createElement("div", { ref: this.vegaLiteWrapperRefHandler, styleName: this.state.hovered ? 'plot-scroll' : 'plot', className: "persist-scroll", onMouseEnter: this.onMouseEnter, onMouseLeave: this.onMouseLeave },
                React.createElement(index_2.VegaLite, { spec: spec })),
            notesDiv));
    };
    PlotBase.prototype.componentWillUnmount = function () {
        this.clearHoverTimeout();
    };
    PlotBase.prototype.fields = function () {
        var fieldInfos = this.props.fieldInfos;
        if (fieldInfos) {
            return fieldInfos.map(function (fieldInfo) {
                var fieldDef = fieldInfo.fieldDef, isEnumeratedWildcardField = fieldInfo.isEnumeratedWildcardField;
                return (React.createElement("div", { styleName: "plot-field-info", key: JSON.stringify(fieldDef) },
                    React.createElement(index_1.Field, { fieldDef: fieldDef, caretShow: false, draggable: false, isEnumeratedWildcardField: isEnumeratedWildcardField, isPill: false, filterShow: false })));
            });
        }
        return undefined;
    };
    PlotBase.prototype.clearHoverTimeout = function () {
        if (this.hoverTimeoutId) {
            clearTimeout(this.hoverTimeoutId);
            this.hoverTimeoutId = undefined;
        }
    };
    PlotBase.prototype.clearPreviewTimeout = function () {
        if (this.previewTimeoutId) {
            clearTimeout(this.previewTimeoutId);
            this.previewTimeoutId = undefined;
        }
    };
    PlotBase.prototype.onMouseEnter = function () {
        var _this = this;
        this.hoverTimeoutId = setTimeout(function () {
            // TODO log action
            _this.setState({ hovered: true });
            _this.hoverTimeoutId = undefined;
        }, constants_1.PLOT_HOVER_MIN_DURATION);
    };
    PlotBase.prototype.onMouseLeave = function () {
        this.clearHoverTimeout();
        if (this.state.hovered) {
            this.setState({ hovered: false });
        }
    };
    PlotBase.prototype.onSpecify = function () {
        if (this.props.closeModal) {
            this.props.closeModal();
        }
        this.onPreviewMouseLeave();
        var _a = this.props, handleAction = _a.handleAction, spec = _a.spec;
        handleAction({
            type: shelf_1.SHELF_SPEC_LOAD,
            payload: { spec: spec, keepWildcardMark: true }
        });
    };
    PlotBase.prototype.onPreviewMouseEnter = function () {
        var _this = this;
        this.previewTimeoutId = setTimeout(function () {
            var _a = _this.props, handleAction = _a.handleAction, spec = _a.spec;
            _this.setState({ preview: true });
            handleAction({
                type: shelf_preview_1.SHELF_PREVIEW_SPEC,
                payload: { spec: spec }
            });
            _this.previewTimeoutId = undefined;
        }, constants_1.PLOT_HOVER_MIN_DURATION);
    };
    PlotBase.prototype.onPreviewMouseLeave = function () {
        this.clearPreviewTimeout();
        if (this.state.preview) {
            this.setState({ preview: false });
            var handleAction = this.props.handleAction;
            handleAction({ type: shelf_preview_1.SHELF_PREVIEW_SPEC_DISABLE });
        }
    };
    PlotBase.prototype.specifyButton = function () {
        return React.createElement("i", { className: "fa fa-server", styleName: "specify-command", onClick: this.onSpecify, onMouseEnter: this.onPreviewMouseEnter, onMouseLeave: this.onPreviewMouseLeave });
    };
    PlotBase.prototype.bookmarkButton = function () {
        var plotObject = {
            fieldInfos: this.props.fieldInfos,
            spec: this.props.spec
        };
        return (React.createElement(bookmarkbutton_1.BookmarkButton, { bookmark: this.props.bookmark, plotObject: plotObject, handleAction: this.props.handleAction }));
    };
    PlotBase.prototype.handleTextChange = function (event) {
        var handleAction = this.props.handleAction;
        handleAction({
            type: bookmark_1.BOOKMARK_MODIFY_NOTE,
            payload: {
                note: event.target.value,
                spec: this.props.spec
            }
        });
    };
    PlotBase.prototype.copySpecButton = function () {
        return (React.createElement(CopyToClipboard, { onCopy: this.copied.bind(this), text: JSON.stringify(this.props.spec, null, 2) },
            React.createElement("i", { className: 'fa fa-clipboard' })));
    };
    PlotBase.prototype.copied = function () {
        var _this = this;
        this.setState({
            copiedPopupIsOpened: true
        });
        window.setTimeout(function () {
            _this.setState({
                copiedPopupIsOpened: false
            });
        }, 1000);
    };
    PlotBase.prototype.isVerticallyOverFlown = function (element) {
        return element.scrollHeight > element.clientHeight;
    };
    return PlotBase;
}(React.PureComponent));
exports.PlotBase = PlotBase;
exports.Plot = CSSModules(PlotBase, styles);