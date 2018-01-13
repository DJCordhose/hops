import ReactRouter from 'react-router';

export const Miss = ReactRouter.withRouter(function Miss(props) {
  if (props.staticContext) {
    props.staticContext.miss = true;
  }
  return null;
});

export const Status = ReactRouter.withRouter(function Status(props) {
  if (props.staticContext) {
    props.staticContext.status = props.code || 200;
  }
  return null;
});
