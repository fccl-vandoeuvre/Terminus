Builtin.def('exit', [], function (args, env, sys) {
  let hret = env.cwd.tryhook('exit', args)
  if (hret && hret.ret) return hret.ret
  setTimeout(() => {
    dom.body.innerHTML = _('cmd_exit_html')
  }, 2000)
  return _stdout(_('cmd_exit'))
}).hidden = 1
