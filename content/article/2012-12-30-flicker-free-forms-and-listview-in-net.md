{
    "categories": [ "Development" ],
    "date": "2012-12-30T14:51:38Z",
    "description": "Just one solution to a flicker problem I encountered when developing a windows form application.",
    "tags": [ "vb", "dotnet" ],
    "title": "Flicker free forms and listview in .Net",
    "toc": true
}

On a project I have been working on recently, I came across a problem where under Windows an Mdi Child form would flicker when it loads. Trying to find information on what was the cause of this was near impossible. I ended up trying a lot of code snippets that I found when googling the problem and this is what I have come up with.
<!--more-->

Next up, the code. Following this I shall explain, to the best of my ability, what the code does:

```vb
Protected Overrides ReadOnly Property CreateParams() As System.Windows.Forms.CreateParams
    Get
        Dim cp As CreateParams = MyBase.CreateParams
        cp.ExStyle = cp.ExStyle Or &H2000000
        Return cp
    End Get
End Property
```

Apparently there are two causes for the flicker that happens to a Windows form. Until writing this post I did not know of the reasons why. *[Source MSDN
Forums](http://social.msdn.microsoft.com/Forums/en-US/winforms/thread/aaed00ce-4bc9-424e-8c05-c30213171c2c/)*

**1.** *Windows sends a control two messages when a control needs to be painted. The first one (`WM_ERASEBKGND`) causes the background to be painted (`OnPaintBackground`), the second causes the foreground to be painted (`WM_PAINT`, firing `OnPaint`). Seeing the background drawn first, then the foreground is noticeable when the drawing is slow. Windows Forms has a ready solution for this kind of flicker with ControlStyles.OptimizedDoubleBuffer.*

**2.** *A form that has a lot of controls takes a long time to paint. Especially the Button control in its default style is expensive. Once you get over 50 controls, it starts getting noticeable. The Form class
paints its background first and leaves "holes" where the controls need to go. Those holes are usually white, black when you use the `Opacity` or `TransparencyKey property`. Then each control gets painted, filling
in the holes. The visual effect is ugly and there's no ready solution for it in Windows Forms. `Double-buffering` can't solve it as it only works for a single control, not a composite set of controls.*

The `CreateParams` property should only be overridden when wrapping an existing Windows control or when you need to set the style of the control. Microsoft recommend that you inherit the problem control and
then override the `CreateParams`, not the way that I actually used it.

I applied this at the top of every form in my code, ran the code under Windows 7 (my development machine) and Windows XP (the target machine) and everything appeared to render a lot better with the nasty double
flicker gone. All I know about the code above, is that it overrides the styling of the controls and waits until the form is fully painted before showing the form.

It wasn't until further testing of the code that I discovered that the original code caused an MDI child form to max out the CPU and hang the application. I tried commenting out all of the code, removing any
background threads that were running (including timers etc) and as soon as I enabled the code, it would hang the application again. This left me and my colleagues very stumped for a few hours. After this period of
time, I bit the bullet and decided to uncomment every section of my code until I could find the problem.

Eventually I found the code above to be the problem, which worked fine under Windows 7. So the solution was quiet easy, detect what version of the operating system we are on and only apply the style if we are on
Vista or higher.

```vb
Protected Overrides ReadOnly Property CreateParams() As System.Windows.Forms.CreateParams
    Get
        Dim cp As CreateParams = MyBase.CreateParams
        Dim OSVer As Version = System.Environment.OSVersion.Version()
        Select Case OSVer.Major
            Case Is <= 5
            Case 5
                If OSVer.Minor > 0 Then
                    cp.ExStyle = cp.ExStyle Or &H2000000
                End If
            Case Is > 5
                cp.ExStyle = cp.ExStyle Or &H2000000
            Case Else
        End Select
        Return cp
    End Get
End Property
```

So I had finally fixed the problem with the CPU usage. Deployed the version for the client to test and everything was ok. By this time, I had a massive headache and it wasn't quiet the end of the day. What a
better way to end the day but by ending off with another rending issue. Although I had fixed the issue with the CPU, I had noticed that when you moved the form, and loading the form in some cases, a list view in
details mode would not render correctly.

After reading around about the issue, I have merged from a number of source's to create a flicker free list view. To use the code, place the class into your project, open up the target form's designer code (*You
will need to show all files in VS*) and replace the instances of `ListView` with `FlickerFreeListView`. Here is the code:

```vb
Public Class FlickerFreeListView
    Inherits System.Windows.Forms.ListView

    Public Sub New()

        MyBase.New()

        Me.SetStyle(ControlStyles.Opaque, True)
        Me.SetStyle(ControlStyles.OptimizedDoubleBuffer, True)
        Me.SetStyle(ControlStyles.ResizeRedraw, True)
        Me.SetStyle(ControlStyles.AllPaintingInWmPaint, True)
        Me.SetStyle(ControlStyles.EnableNotifyMessage, True)

    End Sub

    Protected Overrides Sub OnNotifyMessage(ByVal m As Message)
        If (m.Msg <> &H14) Then
            MyBase.OnNotifyMessage(m)
        End If
    End Sub

End Class
```

The code basically blocks the background from being re-drawn every time an item is added into the `ListView` control. It also sets the `OptimizedDoubleBuffer` to help prevent any issues, amongst other things.

I hope that this will help someone have less of a headache that I had when I was looking around for a solution to this problem. Feel free to try it at your own risk and notify me if you have any
troubles.
